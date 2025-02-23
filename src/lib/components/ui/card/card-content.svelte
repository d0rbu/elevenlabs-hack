<script>
	import { cn } from "$lib/lib/utils.js";
	let className = undefined;
	export { className as class };
</script>

<div class={cn("p-6", className)} {...$$restProps}>
	<slot />
</div>
