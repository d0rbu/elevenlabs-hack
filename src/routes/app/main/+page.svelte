<script>
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { name } from "$lib/constants";
  import { goto } from "$app/navigation";

  let { data } = $props();
  let { supabase } = $derived(data);
  let user = $state(0);
  let users = $state([{
    id: "hg1nXWYvV4OMLu8PECu6",
    name: "Helen",
    age: 26,
    job: "Software Engineer",
    imgs: [
      "https://cdn.pixabay.com/photo/2020/02/01/03/00/girl-4809433_1280.jpg",
      "https://cdn.pixabay.com/photo/2020/02/01/03/00/girl-4809434_1280.jpg",
    ],
  }, {
    id: "hg1nXWYvV4OMLu8PECu6",
    name: "Linda",
    age: 30,
    job: "Data Scientist",
    imgs: [
      "https://cdn.pixabay.com/photo/2020/03/23/13/19/fashion-4960850_1280.jpg"
    ]
  }]);

  function navigate(page) {
    goto(page);
  }

  // on double tap move to next user
  async function handleDoubleTap() {
    await supabase
      .from('liked')
      .insert({ liker: 'id', likee: users[user].id})
    user = (user + 1) % users.length;
  }
  // on swipe left move to next user
  function handleSwipeLeft() {
    user = (user + 1) % users.length;
  }

</script>
<div class="relative h-full w-full">
  <h1 class="text-center text-2xl mt-5">{name}</h1>
  {#each users[user].imgs as img, index}
    <Card.Root class="w-7/8 m-auto mt-4 mb=4">
      <Card.Content
        class="flex flex-col items-center w-full p-0 relative h-[250] rounded-md"
      >
        <img src={img} alt="user" class="w-full h-full object-cover rounded-md" />
        {#if index == 0}
          <div
            class="w-full flex justify-between p-3 absolute bottom-0 bg-white/50 backdrop-blur-md rounded-b-md"
          >
            <h1 class="font-semibold">{users[user].name}</h1>
            <h4>{users[user].age}</h4>
            <p>{users[user].job}</p>
          </div>
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <!-- svelte-ignore event_directive_deprecated -->
          <div
            on:click={() => {navigate(`/app/main/agent_chat/${users[user].id}/${users[user].name}`)}}
            class="size-10 rounded-full bg-radial-[at_50%_75%] from-sky-200 via-blue-400 to-indigo-900 to-90% absolute top-2 right-2 animate-gradient cursor-pointer"
          ></div>
        {/if}
      </Card.Content>
    </Card.Root>
  {/each}

  <!-- button with a check mark -->
  <Button
    class="absolute bottom-15 right-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow duration-200 text-oklch(0.147 0.004 49.25) hover:bg-gray-100 cursor-pointer"
    on:click={handleDoubleTap}
    >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
    </svg>
  </Button>
  <Button
    class="absolute bottom-15 left-4 bg-white rounded-full p-2 shadow-md  hover:shadow-lg transition-shadow duration-200 text-oklch(0.147 0.004 49.25) hover:bg-gray-100 cursor-pointer"
    on:click={handleSwipeLeft}
    >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  </Button>
  
</div>

<style>
  @keyframes gradientShift {
    0% {
      --tw-gradient-from: #93c5fd; /* Soft Sky Blue */
      --tw-gradient-via: #3b82f6; /* Blue */
      --tw-gradient-to: #312e81; /* Dark Indigo */
      background-position: 0% 0%;
    }
    50% {
      --tw-gradient-from: #60a5fa; /* Slightly Richer Blue */
      --tw-gradient-via: #2563eb; /* Deeper Blue */
      --tw-gradient-to: #1e3a8a; /* Subtle Indigo Shift */
      background-position: 60% 60%;
    }
    100% {
      --tw-gradient-from: #93c5fd; /* Reset to Soft Blue */
      --tw-gradient-via: #3b82f6;
      --tw-gradient-to: #312e81;
      background-position: 0% 0%;
    }
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradientShift 4s infinite ease-in-out;
  }
</style>
