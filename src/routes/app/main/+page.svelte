<script>
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { name } from "$lib/constants";
  import { goto } from "$app/navigation";

  let { data } = $props();
  let { supabase } = $derived(data);
  let user = $state(0);
  let users = $state([
    {
    id: "sno2byzLye94Xv9DHjAQ",
    name: "Olivia",
    age: 24,
    job: "Singer",
    imgs: [
      {"type": "url", "content": "https://i.pinimg.com/736x/3a/cc/97/3acc9795b76e3dbf3ef1ab5a57a45131.jpg"},
      {"type": "card", "content": {"title": "Hobbies", "description": "I enjoy singing and dancing for millions of people!"}},
      {"type": "url", "content": "https://i.pinimg.com/736x/9c/bc/8b/9cbc8b08a62421b421c935806e593a19.jpg"},
      {"type": "card", "content": {"title": "Travel Story", "description": "I once performed in front of a huge crowd in Paris. The energy was electric, and I felt so alive on stage!"}},
      {"type": "url", "content": "https://i.pinimg.com/736x/a8/75/a2/a875a2de324c15199dd692d1efa624c8.jpg"},
    ]
  },  
  {
    id: "KCrJVitqA22Wgz7TZQJi",
    name: "Helen",
    age: 26,
    job: "Software Engineer",
    imgs: [
      {"type": "url", "content": "https://cdn.pixabay.com/photo/2020/02/01/03/00/girl-4809433_1280.jpg"},
      {"type": "url", "content": "https://cdn.pixabay.com/photo/2020/02/01/03/00/girl-4809434_1280.jpg"},
      {"type": "card", "content": {"title": "Hobbies", "description": "Reading, Traveling, Cooking"}},
      {"type": "url", "content": "https://cdn.pixabay.com/photo/2023/06/07/16/18/vietnam-8047523_1280.jpg"},
      {"type": "card", "content": {"title": "Share an interesting travel story", "description": "During my gap year, I climbed Mount Kilimanjaro. It was a super fun experience, and I met so many amazing people along the way. The view from the top was breathtaking!"}},
      {"type": "url", "content": "https://cdn.pixabay.com/photo/2017/12/30/13/25/meadow-3050075_1280.jpg"}
    ],
  },
]);

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
    <Card.Root class="w-7/8 m-auto mt-4 mb=4 bg-transparent shadow-none border-none">
      <Card.Content
        class="flex flex-col items-center w-full p-0 relative {img.type == "url" ? "h-[250]" : ""} rounded-md {index == users[user].imgs.length - 1 ? 'mb-20' : 'mb-0'}"
      >
        {console.log(img)}
        {#if img.type == "url"}
          <img src={img.content} alt="user" class="w-full h-full object-cover rounded-md" />
        {/if}

        {#if img.type == "card"}
          <Card.Root class="w-full h-full bg-white shadow-md rounded-md">
            <Card.Content class="p-4">
              <h1 class="text-xl">{img.content.title}</h1>
              <p class="text-gray-600">{img.content.description}</p>
            </Card.Content>
          </Card.Root>
        {/if}

        {#if index == 0}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <!-- svelte-ignore event_directive_deprecated -->
          <div
            on:click={() => {navigate(`/app/main/agent_chat/${users[user].id}/${users[user].name}`)}}
            class="size-10 rounded-full bg-radial-[at_50%_75%] from-sky-200 via-blue-400 to-indigo-900 to-90% absolute top-2 right-2 animate-gradient cursor-pointer"
          ></div>
        {/if}
      </Card.Content>
      <Card.Footer class="flex flex-col items-center w-full p-0 relative rounded-md bg-transparent {index == 0 ? 'h-[100px]' : 'h-[0px]'}">
        {#if index == 0}
        <div
            class="w-full justify-between p-3 bottom-0 bg-transparent rounded-b-md"
          >
            <h1 class="text-xl mt-0">{users[user].name}</h1>
            <h4>{users[user].age}</h4>
            <p>{users[user].job}</p>
        </div>
        {/if}
        </Card.Footer>
    </Card.Root>
  {/each}

  <!-- button with a check mark -->
  <Button
    class="fixed bottom-15 right-180 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow duration-200 text-oklch(0.147 0.004 49.25) hover:bg-gray-100 cursor-pointer"
    on:click={handleDoubleTap}
    >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
    </svg>
  </Button>
  <Button
    class="fixed bottom-15 left-180 bg-white rounded-full p-2 shadow-md  hover:shadow-lg transition-shadow duration-200 text-oklch(0.147 0.004 49.25) hover:bg-gray-100 cursor-pointer"
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
