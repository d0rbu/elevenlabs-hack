<script>
  import * as Card from "$lib/components/ui/card/index.js";
  let { data } = $props();
  let { supabase } = $derived(data);

  let user = $state({
    id: 1,
    name: "Haroon",
    age: 26,
    job: "Software Engineer",
    imgs: [
      "https://cdn.pixabay.com/photo/2020/02/01/03/00/girl-4809433_1280.jpg",
      "https://cdn.pixabay.com/photo/2020/02/01/03/00/girl-4809434_1280.jpg",
    ],
  });
</script>

<div class="relative h-full w-full">
  <h1 class="text-center text-2xl mt-5">{user.name}</h1>
  {#each user.imgs as img, index}
    <Card.Root class="w-7/8 m-auto mt-4 mb=4">
      <Card.Content
        class="flex flex-col items-center w-full p-0 relative h-[250] rounded-md"
      >
        <img
          src={img}
          alt="user"
          class="w-full h-full object-cover rounded-md"
        />
        {#if index == 0}
          <div
            class="w-full flex justify-between p-3 absolute bottom-0 bg-white/50 backdrop-blur-md"
          >
            <h1>{user.name}</h1>
            <h4>{user.age}</h4>
            <p>{user.job}</p>
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  {/each}
</div>
