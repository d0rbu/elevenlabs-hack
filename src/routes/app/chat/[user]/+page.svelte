<script>
  import { onMount } from "svelte";

  const { data } = $props();
  const { chats: initialChats, user: userId, otherUser: otherUserId, supabase } = data;

  let chats = $state(initialChats);
  let newMessage = $state('');

  async function sendMessage() {
    if (newMessage.trim() === "") return;

    const { data, error } = await supabase
      .from("chats")
      .insert([
        {
          sender: userId,
          message: newMessage,
          profileImage: "/path/to/user-image.jpg",
          recipient: otherUserId,
        },
      ]);

    if (error) {
      console.error("Error sending message:", error);
    } else {
      chats = [...chats, data[0]];
      newMessage = "";
    }
  }

  async function fetchChats() {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .or(`(sender.eq.${userId},recipient.eq.${otherUserId})`)
      .or(`(sender.eq.${otherUserId},recipient.eq.${userId})`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching chats:", error);
    } else {
      chats = data;
    }
  }

  onMount(() => {
    fetchChats();
  });
</script>

<div class="chat-container">
  {#each chats as chat}
    <div class="chat-message {chat.sender}">
      {#if chat.sender === "bot"}
        <img src={chat.profileImage} alt="Bot" class="profile-image" />
      {/if}
      <div>{chat.message}</div>
      {#if chat.sender === "user"}
        <img src={chat.profileImage} alt="User" class="profile-image" />
      {/if}
    </div>
  {/each}
  <div>
    <input
      type="text"
      bind:value={newMessage}
      placeholder="Type a message..."
    />
    <button on:click={sendMessage}>Send</button>
  </div>
</div>

<style>
  .chat-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .chat-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 5px;
    max-width: 60%;
  }

  .chat-message.user {
    align-self: flex-end;
    background-color: #d1e7dd;
  }

  .chat-message.bot {
    align-self: flex-start;
    background-color: #f8d7da;
  }

  .profile-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
</style>
