<script>
  let { data, children } = $props()
  import "../app.css";

  import { invalidate } from '$app/navigation'
  import { onMount } from 'svelte'

  let { session, supabase } = $derived(data)

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth')
      }
    })

    return () => data.subscription.unsubscribe()
  })
</script>

<style>
  /* latin-ext */
  @font-face {
    font-family: 'Libre Baskerville';
    font-style: italic;
    font-weight: 400;
    font-display: swap;
    src: url(https://fonts.gstatic.com/s/librebaskerville/v14/kmKhZrc3Hgbbcjq75U4uslyuy4kn0qNcWx8QDP2V.woff2) format('woff2');
    unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
  }

  h1 {
      font-family: Libre Baskerville;
  }
  h4 {
      font-family: Libre Baskerville;
  }
</style>

<div class="flex flex-col items-center justify-center h-screen bg-black">
  <div class="items-stretch aspect-18/39 bg-muted h-full overflow-scroll relative">
    {@render children()} 
  </div>
</div>
