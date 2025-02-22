<script>
  let { children } = $props();
  import "../app.css";
</script>

<div class="flex flex-col items-center justify-center h-screen bg-black">
  <div class="items-stretch aspect-18/39 bg-muted h-full">
    {@render children()} 
  </div>
</div>