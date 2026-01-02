<script lang="ts">
	import { enhance } from '$app/forms';

	export let data
</script>

<h1>main page</h1>

<a href="/login"><button>login</button></a>
<button>test</button>

<form use:enhance action="/logout" method="POST">
	<button type="submit">logout</button>
</form>

{#if data.locals.user}
	dziala
{/if}