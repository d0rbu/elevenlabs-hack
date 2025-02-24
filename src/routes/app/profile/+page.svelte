<script>
  import * as Card from "$lib/components/ui/card/index.js";
  let { data } = $props();
  let { supabase } = $derived(data);

  let user = $state({
    id: 1,
    name: "Haroon",
    age: 22,
    job: "Student",
    imgs: [
      "https://media.licdn.com/dms/image/v2/D4E03AQGHnnj617ckTQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1730003015546?e=2147483647&v=beta&t=66YRRl1GaahLNoRtWaYBxSS4g6hM5_YYvHkwrEyaBBA",
      "https://pbs.twimg.com/media/FSLeHgvXMAMPNQT.jpg:large",
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
