<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css'

	let { data, children } = $props();
	let user = $derived(data.user);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	<nav>
		<ul>
			<li><a href="/"><strong>Quizonline</strong></a></li>
			{#if user}
				<li><a href="/me/quizzes">Twoje quizy</a></li>
				<li><a href="/me/stats">Statystyki</a></li>
			{/if}
		</ul>
		<ul>
			{#if user}
				<form method="post" action="/logout">
					<button class="outline">Wyloguj</button>
				</form>
			{:else}
				<a href="/login">
					<button class="outline">Zaloguj</button>
				</a>
			{/if}
		</ul>
	</nav>
</header>

<main>
	{@render children()}
</main>
