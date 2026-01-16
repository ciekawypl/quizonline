<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<h1>Login page</h1>

<article>
	<form action="?/login" method="POST" use:enhance>
		<input name="username" type="text" placeholder="login"/>
		<input name="password" type="password" placeholder="password"/>
		<button type="submit">Log in</button>
		<button type="submit" formaction="?/register">Register</button>
	</form>
</article>

{#if form?.error}
	<p>{form.error}</p>
{/if}
