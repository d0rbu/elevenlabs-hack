<script>
    import { onMount, onDestroy } from "svelte";
    import { Conversation } from "@11labs/client";
    import Orb from "@/components/orb.svelte";

    let conversation = $state(null);
    let conversationMode = $state("speaking");
    let connected = $state(false);
    let talking = $state(false);
    let { data } = $props();
    let { agentId, supabase } = $derived(data);
    let orbSize = $derived(Math.max(startButtonWidth, startButtonHeight) * 1.03);

    $effect(async () => {
      if (talking) {
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
      } else if (!talking && conversation) {
        await conversation.endSession();
      }
    });
  </script>
  
  <style>
    .chat-container {
      max-width: 600px;
      margin: auto;
      padding: 20px;
      border-radius: 8px;
      background: #1a1a1a;
      color: white;
    }
  
    .messages {
      margin-top: 20px;
      background: #222;
      padding: 10px;
      border-radius: 5px;
      height: 300px;
      overflow-y: auto;
    }
  
    button {
      background: #4caf50;
      color: white;
      padding: 10px 15px;
      border: none;
      cursor: pointer;
      margin-top: 10px;
    }
  
    button:disabled {
      background: #888;
      cursor: not-allowed;
    }
  </style>
  
  <div class="chat-container">
    <h2>ElevenLabs AI Chat</h2>
    <p>Agent ID: {agentId}</p>
  
    <Orb
      width={orbSize}
      height={orbSize}
      conversation={conversation}
      connected={connected}
      mode={conversationMode}
      fps={30}
    />
  </div>
  