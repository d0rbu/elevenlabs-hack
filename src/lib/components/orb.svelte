<script>
  import { onMount } from "svelte";

  let {
    primary = "#312ea1",
    secondary = "#3b82f6",
    bg = "#93c5fd",
    width = 200,
    height = 200,
    noiseFactors = [Math.PI, 2, 1 / 7, Math.sqrt(2)],
    amplitudeFactor = 1.0,
    bgAmplitudeFactor = 0.4,
    numLines = 10,
    totalHueShiftFactor = 100,
    lineFrequencyFactor = 1.0,
    lineResolution = 4,
    conversationScaleFactor = 0.5,
    conversationWaveFactorMin = 0.7,
    conversationWaveFactorMax = 1.5,
    fps = 60,
    conversation = null,
    connected = false,
    conversationMode = "speaking",
  } = $props();

  function shiftHue(hex, deg) {
    let hsl = hexToHSL(hex);
    hsl.h = (hsl.h + deg) % 360;
    return hslToHex(hsl.h, hsl.s, hsl.l);
  }

  function adjustBrightness(hex, percent) {
    let hsl = hexToHSL(hex);
    hsl.l = Math.min(100, hsl.l * (1 + percent / 100));
    return hslToHex(hsl.h, hsl.s, hsl.l);
  }

  function hexToHSL(H) {
    let r = parseInt(H.slice(1, 3), 16) / 255;
    let g = parseInt(H.slice(3, 5), 16) / 255;
    let b = parseInt(H.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h *= 60;
    }
    return { h, s: s * 100, l: l * 100 };
  }

  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = l - c / 2;
    let r, g, b;

    if (h < 60) {
      (r = c), (g = x), (b = 0);
    } else if (h < 120) {
      (r = x), (g = c), (b = 0);
    } else if (h < 180) {
      (r = 0), (g = c), (b = x);
    } else if (h < 240) {
      (r = 0), (g = x), (b = c);
    } else if (h < 300) {
      (r = x), (g = 0), (b = c);
    } else {
      (r = c), (g = 0), (b = x);
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  }

  let calculateNoise = (time) => {
    return (
      noiseFactors.map((f) => Math.sin(time * f)).reduce((a, b) => a + b, 0) /
      noiseFactors.length
    );
  };

  let canvas;
  let ctx;
  let mounted = $state(false);
  let time = $state(Date.now() / 1000);
  let outputFrequencyData = $state([0]);
  let avgVolume = $derived(
    outputFrequencyData.reduce((a, b) => a + b, 0) / outputFrequencyData.length,
  );
  let currentConversationScaleFactor = $derived(
    1 - (avgVolume / 255) * conversationScaleFactor,
  );
  let totalNoise = $derived(calculateNoise(time));
  let gradientCenter = $derived({
    x: totalNoise * 50 * bgAmplitudeFactor + 50,
    y: 50,
  });

  $effect(() => {
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext("2d");
    }
  });

  let animate = () => {
    if (canvas && width && height) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let lineIndex = 0; lineIndex < numLines; lineIndex++) {
        const hueShifted = shiftHue(secondary, totalHueShiftFactor * (1 - lineIndex / numLines));
        const brightStroke = adjustBrightness(hueShifted, 20);
        const shadowColor = adjustBrightness(hueShifted, -10);
        const outputFrequencyDataBucket = outputFrequencyData.slice(
          Math.floor((lineIndex / numLines) * outputFrequencyData.length),
          Math.floor(((lineIndex + 1) / numLines) * outputFrequencyData.length),
        );
        const avgVolumeBucket =
          outputFrequencyDataBucket.reduce((a, b) => a + b, 0) /
          outputFrequencyDataBucket.length;
        const conversationAmplitudeFactor = conversation
          ? conversationWaveFactorMin +
            ((conversationWaveFactorMax - conversationWaveFactorMin) *
              avgVolumeBucket) /
              255
          : 1;

        ctx.strokeStyle = brightStroke + "80"; // 50% opacity stroke
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 15;
        ctx.lineWidth = 10;

        ctx.beginPath();
        ctx.moveTo(0, height / 2);

        let prevX = 0;
        let prevY = height / 2;

        for (let i = 0; i < lineResolution + 2; i++) {
          let x = i * (width / lineResolution);
          let currentTime =
            time + (lineIndex + x / width) * lineFrequencyFactor;
          let centerBias = Math.sin((x / width) * Math.PI);
          let noise =
            calculateNoise(currentTime) *
            centerBias *
            amplitudeFactor *
            conversationAmplitudeFactor;
          let y = height / 2 + noise * (height / 2);

          let cpX = (prevX + x) / 2;
          let cpY = (prevY + y) / 2;

          ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);

          prevX = x;
          prevY = y;
        }

        ctx.stroke();
        ctx.closePath();
      }

      // draw a circle around the whole thing
      ctx.strokeStyle = adjustBrightness(primary, 50) + "50";
      ctx.lineWidth = 10;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, width / 2 - 5, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();
    }

    requestAnimationFrame(animate);
  };

  onMount(() => {
    mounted = true;
    animate();

    setInterval(() => {
      time = Date.now() / 1000;
      if (conversation) {
        outputFrequencyData = Array.from(
          conversation.getOutputByteFrequencyData(),
        );
      }
    }, 1000 / fps);
  });
</script>

<canvas
  bind:this={canvas}
  class="orb {mounted ? '' : 'hidden'}"
  style="--primary: {primary}; --secondary: {secondary}; --bg: {bg}; --gradient-center: {gradientCenter.x}% {gradientCenter.y}%; --conversation-scale-factor: {currentConversationScaleFactor}"
></canvas>

<style>
  .orb {
    background: radial-gradient(
      circle at var(--gradient-center),
      var(--primary),
      var(--bg)
    );
    scale: var(--conversation-scale-factor);
    border-radius: 50%;
    transition: scale 0.5s;
  }
</style>
