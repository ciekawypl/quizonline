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
		<a href="/"><button>Home</button></a>
		{#if user}
			<a href="/me/quizzes"><button>Your quizzes</button></a>
			<form action="/logout" method="post" use:enhance><button>Logout</button></form>
		{:else}
			<a href="/login"><button>Login</button></a>
		{/if}
	</nav>
</header>

<main>
	{@render children()}
</main>
