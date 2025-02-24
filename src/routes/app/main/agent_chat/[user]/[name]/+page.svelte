<script>
    import { onDestroy } from "svelte";
    import { Conversation } from "@11labs/client";
    import Orb from "@/components/orb.svelte";
    import { name } from "$lib/constants";
    
    let conversation = $state(null);
    let conversationMode = $state("speaking");
    let connected = $state(false);
    let talking = $state(true);
    let { data } = $props();
    let { agentId, name: userName, supabase } = $derived(data);

    $effect(async () => {
      if (talking) {
        await navigator.mediaDevices.getUserMedia({ audio: true });

        conversation = await Conversation.startSession({
          agentId: agentId,
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
          dynamicVariables: {
            name,
            agent_name: userName,
          },
        });
      } else if (!talking && conversation) {
        await conversation.endSession();
      }
    });

    onDestroy(() => {
      if (conversation) {
        conversation.endSession();
      }
    });
  </script>
  
  <div class="container w-full h-full flex flex-col items-center justify-evenly h-screen">
    <div class="container w-full flex flex-row items-center justify-center p-6 relative mb-20">
      <!-- back button icon -->
      <a href="/app/main" class="absolute left-6 top-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12H3m0 0l4.5-4.5M3 12l4.5 4.5"
          />
        </svg>
      </a>
      <h1 class="text-center text-2xl mt-0">{name}</h1>
    </div>
    
    <Orb
      width={300}
      height={300}
      conversation={conversation}
      connected={connected}
      mode={conversationMode}
      fps={30}
    />
    <h1 class="text-center text-2xl mt-20 text-semibold mb-20">Helen</h1>
  </div>
  