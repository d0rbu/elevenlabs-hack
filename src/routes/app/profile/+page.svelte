<script>
  import * as Card from "$lib/components/ui/card/index.js";
  import {name} from "@/constants.js";

  let { data } = $props();
  let { supabase } = $derived(data);

  let user = $state({
    id: 1,
    name: "Henry",
    age: 22,
    job: "Software Engineer",
    imgs: [
      {"type": "url", "content": "https://i.pinimg.com/736x/a1/05/35/a10535a0b025220cd48edaf88cda8a6a.jpg"},
      {"type": "card", "content": {"title": "Hobbies", "description": "Working out, hiking, bouldering, backpacking, exploring scenery around the pacific northwest"}},
      {"type": "url", "content": "https://cdn.discordapp.com/attachments/964597974925705236/1343458995213566113/IMG_0112.jpeg?ex=67bd5930&is=67bc07b0&hm=ec98e55a266cea09c0f6bcbedb57257c0d5d03a3c7a171383f685f909cfd0039&"},
      {"type": "card", "content": {"title": "About myself", "description": "I'm 5 foot 6 and based in the Seattle area. Ask me about some recent backpacking trips! I'm always looking for new places to explore."}},
      {"type": "url", "content": "https://i.pinimg.com/736x/89/7f/d0/897fd0776ec3db2fde68c014f12f91c3.jpg"}
    ],
  });
</script>

<div class="relative h-full w-full">
  <h1 class="text-center text-2xl mt-5">{name}</h1>
  {#each user.imgs as img, index}
    <Card.Root class="w-7/8 m-auto mt-4 mb=4 bg-transparent shadow-none border-none">
      <Card.Content
        class="flex flex-col items-center w-full p-0 relative {img.type == "url" ? "h-[250]" : ""} rounded-md {index == user.imgs.length - 1 ? 'mb-20' : 'mb-0'}"
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
      </Card.Content>
      <Card.Footer class="flex flex-col items-center w-full p-0 relative rounded-md bg-transparent {index == 0 ? 'h-[100px]' : 'h-[0px]'}">
        {#if index == 0}
        <div
            class="w-full justify-between p-3 bottom-0 bg-transparent rounded-b-md"
          >
            <h1 class="text-xl mt-0">{user.name}</h1>
            <h4>{user.age}</h4>
            <p>{user.job}</p>
        </div>
        {/if}
        </Card.Footer>
    </Card.Root>
  {/each}
</div>
