<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { enhance } from '$app/forms';

	let { data, children } = $props();
	let user = $derived(data.user);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	<nav>
		<ul>
			<li><a href="/"><strong>Home</strong></a></li>
			{#if user}
				<li><a href="/me/quizzes">Your quizzes</a></li>
			{/if}
		</ul>
		<ul>
			{#if user}
				<form method="post" action="/logout">
					<button class="outline">Logout</button>
				</form>
			{:else}
				<a href="/login">
					<button class="outline">Login</button>
				</a>
			{/if}
		</ul>
	</nav>
</header>

<main>
	{@render children()}
</main>
