<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { House, User, MessageCircle } from "lucide-svelte";

  const PAGE = {
    MAIN: "/app/main",
    CHAT: "/app/chat",
    PROFILE: "/app/profile",
  };
  let currentPage = $page.url.pathname;

  let isMain = $derived(currentPage === PAGE.MAIN);
  let isChat = $derived(currentPage === PAGE.CHAT);
  let isProfile = $derived(currentPage === PAGE.PROFILE);

  function navigate(page) {
    goto(page);
  }

  // AUTH
  let { data, children } = $props();
  let { supabase } = $derived(data);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }
  };
</script>

<div class="flex flex-col items-center justify-center h-screen w-full relative">
  <slot />

  <div
    class="footer bottom-0 absolute flex w-full justify-around bg-gray-200 border-t border-gray-200 p-2"
  >
    <a
      class="icon"
      class:active={isMain} 
      on:click={() => navigate("/app/main")}
    >
      <House />
    </a>
    <a
      class="icon"
      class:active={isChat}
      on:click={() => navigate("/app/chat")}
    >
      <MessageCircle />
    </a>
    <a
      class="icon"
      class:active={isProfile}
      on:click={() => navigate("/app/profile")}
    >
      <User />
    </a>
  </div>
</div>

<style>
  .icon {
    cursor: pointer;
    font-size: 24px;
  }
  .active {
    color: blue;
  }
</style>
