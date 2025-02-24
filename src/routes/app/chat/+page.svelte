<script>
  import * as Avatar from "$lib/components/ui/avatar";
  import { name } from "@/constants";

  // Sample data for conversations
  let conversations = [
    {
      id: 1,
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      profileImage: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      name: "Jane Smith",
      lastMessage: "Let's catch up tomorrow!",
      profileImage: "https://via.placeholder.com/150",
    },
    {
      id: 3,
      name: "Alice Johnson",
      lastMessage: "Can you send me the report?",
      profileImage: "https://via.placeholder.com/150",
    },
  ];
</script>

<div class="chat-list h-full p-6">
<h1 class="text-center text-2xl mt-2 mb-3">{name}</h1>
  {#each conversations as conversation}
    <div class="chat-item">
      <Avatar.Root>
        <Avatar.Image src={conversation.profileImage} alt={conversation.name} />
        <Avatar.Fallback>{conversation.name.charAt(0)}</Avatar.Fallback>
      </Avatar.Root>
      <div class="chat-details">
        <div class="chat-name">{conversation.name}</div>
        <div class="chat-last-message">{conversation.lastMessage}</div>
      </div>
    </div>
  {/each}
</div>

<style>
  .chat-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: top;
  }
  .chat-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }
  .chat-details {
    margin-left: 1rem;
  }
  .chat-name {
    font-weight: bold;
  }
  .chat-last-message {
    color: #666;
  }
</style>
