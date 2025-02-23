<script>
  import { text } from "$lib/flags";
  import { agentName, name, tagline } from "$lib/constants";
  import { Conversation } from "@11labs/client";
  import { PUBLIC_ONBOARDING_AGENT_ID } from "$env/static/public";
  import ImageUp from "lucide-svelte/icons/image-up";

  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import Orb from "@/components/orb.svelte";
  import { onMount } from "svelte";
  import { on } from "svelte/events";
  import { image } from "framer-motion/client";

  let { data } = $props();
  let { supabase } = $derived(data);

  const STATE = {
    SPLASH: "splash",
    ONBOARDING: "onboarding",
    ERROR: "error",
  };
  let state = $state(STATE.SPLASH);
  let conversation = $state(null);
  let userId = $state(null);

  let inSplash = $derived(state === STATE.SPLASH);
  let _splashVisibilityClasses = $derived(
    inSplash ? "opacity-100" : "opacity-0",
  );
  let splashVisibilityClasses = $derived("splash " + _splashVisibilityClasses);
  let splashFunctionalityClasses = $derived(inSplash ? "cursor-pointer" : "");
  let inOnboarding = $derived(state === STATE.ONBOARDING);
  let onboardingVisibilityClasses = $derived(
    state === STATE.ONBOARDING
      ? "opacity-100 scale-150"
      : "opacity-0 pointer-events-none",
  );

  const IMAGE_UPLOAD_STATE = {
    NOT_READY: "not_ready",
    IDLE: "idle",
    UPLOADING: "uploading",
    ANALYZING: "analyzing",
    DONE: "done",
  };

  let startButtonWidth = $state();
  let startButtonHeight = $state();
  let connected = $state(false);
  let conversationMode = $state("speaking");
  let imageUpload = $state(null);
  let imageUploadState = $state(IMAGE_UPLOAD_STATE.NOT_READY);
  let imageUploadVisibilityClasses = $derived(
    {
      [IMAGE_UPLOAD_STATE.NOT_READY]: "opacity-0 pointer-events-none",
      [IMAGE_UPLOAD_STATE.IDLE]: "opacity-100",
      [IMAGE_UPLOAD_STATE.UPLOADING]: "image-uploading",
      [IMAGE_UPLOAD_STATE.ANALYZING]: "image-analyzing",
      [IMAGE_UPLOAD_STATE.DONE]: "opacity-0 pointer-events-none",
    }[imageUploadState],
  );
  let images = $state([]);
  let latestImageAnalysisResolve = $state(null);
  let orbSize = $derived(Math.max(startButtonWidth, startButtonHeight) * 1.03);

  $effect(async () => {
    if (inOnboarding && !userId) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error("Error signing in:", error);
        state = STATE.SPLASH;
        return;
      }

      userId = data?.user?.id;

      if (!userId) {
        console.error("No user ID found");
        state = STATE.SPLASH;
        return;
      }

      await navigator.mediaDevices.getUserMedia({ audio: true });

      conversation = await Conversation.startSession({
        agentId: PUBLIC_ONBOARDING_AGENT_ID,
        onConnect: () => {
          connected = true;
          console.log("Connected");
        },
        onDisconnect: () => {
          connected = false;
          // TODO: use the conversation id to extract the data collected during the conversation from the api
          console.log("Disconnected");
        },
        onError: () => {
          connected = false;
          console.log("Error");
        },
        onModeChange: (mode) => {
          conversationMode = mode;
          console.log("Mode change:", mode);
        },
        clientTools: {
          prompt_photos: async () => {
            let {
              promise: imageAnalysisPromise,
              resolve: imageAnalysisResolve,
              reject: imageAnalysisReject,
            } = Promise.withResolvers();
            latestImageAnalysisResolve = imageAnalysisResolve;

            imageUploadState = IMAGE_UPLOAD_STATE.IDLE;

            const results = await imageAnalysisPromise;
            console.log(results);

            return results.join("\n\n");
          },
        },
        dynamicVariables: {
          name,
          agent_name: agentName,
        },
      });
    } else if (!inOnboarding && conversation) {
      await conversation.endSession();
    }
  });

  const uploadImage = async (file) => {
    try {
      // we gotta make this public temporarily so fal.ai can analyze it, but that's not good! lets hash for an ounce of privacy
      const { data, error } = await supabase.storage
        .from("user_photos")
        .upload(`${userId}/${file.name}`, file);

      if (error) {
        console.error("Upload failed:", error.message);
        console.log("user id", userId);
        console.log("file", file);
        return null;
      }

      // generate a signed URL for the image
      const { data: signedURLData, error: signedURLError } =
        await supabase.storage
          .from("user_photos")
          .createSignedUrl(`${userId}/${file.name}`, 600);

      if (signedURLError) {
        console.error("Error generating signed URL:", signedURLError);
        return null;
      }

      return signedURLData.signedUrl;
    } catch (err) {
      console.error("Unexpected error:", err);
      return null;
    }
  };

  const analyzeImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Error analyzing image:", response.statusText);
      return null;
    }

    return await response.json();
  };

  const onImageSelect = async (e) => {
    imageUploadState = IMAGE_UPLOAD_STATE.UPLOADING;
    const uploadedImages = await Promise.all(
      Array.from(e.target.files).map(uploadImage),
    );
    console.log("uploadedImages", uploadedImages);
    imageUploadState = IMAGE_UPLOAD_STATE.ANALYZING;
    const analyses = await Promise.all(uploadedImages.map(analyzeImage));
    console.log("analyses", analyses);

    images = uploadedImages
      .map((image, i) => ({
        file: image,
        analysis: analyses[i]?.data?.results,
      }))
      .filter((image) => image.analysis !== null);

    if (latestImageAnalysisResolve) {
      latestImageAnalysisResolve(images.map((image) => image.analysis));
      latestImageAnalysisResolve = null;
      imageUploadState = IMAGE_UPLOAD_STATE.DONE;
    } else {
      console.error("No image analysis resolve function found");
      imageUploadState = IMAGE_UPLOAD_STATE.IDLE;
    }
  };
</script>

<title>{name}</title>
<div class="grid h-screen grid-rows-[1fr_auto_1fr]">
  <div
    id="top-section"
    class="flex flex-col items-center justify-center {splashVisibilityClasses}"
  >
    <h1 class="scroll-m-20 text-4xl font-medium tracking-tight lg:text-5xl">
      {name}
    </h1>
    <h4 class="scroll-m-20 text-xl font-medium tracking-tight">
      {tagline}
    </h4>
  </div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div id="middle-section" class="flex flex-col items-center justify-center">
    <form method="POST" action="?/login">
      <label>
        Email
        <input name="email" type="email" />
      </label>
      <label>
        Password
        <input name="password" type="password" />
      </label>
      <button>Login</button>
      <button formaction="?/signup">Sign up</button>
    </form>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 backdrop-blur-md cursor-pointer p-10 rounded-lg upload-button {imageUploadVisibilityClasses}"
      onclick={() => imageUpload.click()}
    >
      <ImageUp class="h-6 w-6" />
      <!-- backdrop -->
      <div
        class="absolute top-0 left-0 w-full h-full bg-white opacity-50 -z-10 rounded-lg"
      ></div>
    </div>
    <div
      class="start-button relative overflow-hidden rounded-sm {splashVisibilityClasses}"
      bind:clientHeight={startButtonHeight}
      bind:clientWidth={startButtonWidth}
    >
      <div class="start-button-inner">
        <Button
          on:click={() => (state = STATE.ONBOARDING)}
          class={splashFunctionalityClasses}
          size="lg"
        >
          <p class="text-2xl font-medium">
            {text("Start talking")}
          </p>
        </Button>
      </div>

      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-visible -z-10"
      >
        <Orb width={orbSize} height={orbSize} />
      </div>
    </div>
    <div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-visible z-10 onboarding-orb {onboardingVisibilityClasses}"
    >
      <Orb
        width={orbSize}
        height={orbSize}
        {conversation}
        {connected}
        mode={conversationMode}
        fps={30}
      />
    </div>
    <input
      style="display:none"
      type="file"
      accept=".jpg, .jpeg, .png"
      bind:this={imageUpload}
      onchange={(e) => onImageSelect(e)}
    />
  </div>
</div>

<div
  id="bottom-section"
  class="flex flex-col items-center justify-center splash"
></div>

<style>
  @keyframes flicker {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
    100% {
      opacity: 1;
    }
  }

  .image-uploading {
    animation: flicker 4s infinite alternate ease-in-out;
  }

  .image-analyzing {
    animation: flicker 1s infinite alternate ease-in-out;
  }

  .upload-button {
    transition: opacity 0.5s ease-in-out;
  }

  .splash {
    transition: opacity 1s;
  }

  .start-button {
    transition:
      transform 0.2s ease-in-out,
      opacity 0.2s ease-in-out;
  }

  .start-button:hover {
    transform: scale(1.05);
  }

  .start-button-inner {
    transition: opacity 0.2s ease-in-out;
  }

  .start-button:hover .start-button-inner {
    opacity: 0.05;
  }

  .onboarding-orb {
    transition:
      opacity 1s,
      transform 1s,
      scale 1s;
  }
</style>
