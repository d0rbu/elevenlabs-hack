<script>
  import { text } from "$lib/flags";
  import { name, tagline } from "$lib/constants";

  import { Button } from "$lib/components/ui/button";

</script>

<title>{name}</title>

<div class="grid h-screen grid-rows-[1fr_auto_1fr]">
  <div id="top-section" class="flex flex-col items-center justify-center">
    <h1 class="scroll-m-20 text-4xl font-semibold tracking-tight lg:text-5xl">
      {name}
    </h1>
    <h4 class="scroll-m-20 text-xl font-semibold tracking-tight">
      {tagline}
     </h4>
  </div>

  <div id="middle-section" class="flex flex-col items-center justify-center">
    <Button href="https://svelte.dev/docs/kit">
      Visit the SvelteKit documentation
    </Button>
  </div>

  <div id="bottom-section" class="flex flex-col items-center justify-center">
  </div>
</div>
