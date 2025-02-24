<script>
  import { text } from "$lib/flags";
  import { agentName, name, tagline } from "$lib/constants";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Card from "$lib/components/ui/card";
  let { data, children } = $props();

  let { supabase } = $derived(data);
</script>

<title>{text("Signup")}</title>
<div class="flex flex-col items-center justify-center">
  <Card.Root class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-3/4 font-sans overflow-hidden">
    <Card.Header>
      <Card.Title class="font-semibold flex justify-center">{text("Complete signup")}</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-4">
      <Label for="password">
        {text("Password")}
      </Label>
      <Input name="password" type="password" placeholder={text("Password")} required id="password" class="w-full" />
      <Button type="submit" size="lg" class="w-full cursor-pointer">
        {text("Submit")}
      </Button>
    </Card.Content>
  </Card.Root>
</div>

<style>
</style>
