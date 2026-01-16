<script>
	import { enhance } from '$app/forms';

	export let data;
</script>

{#if !data.user}
	<h2>Nie jestes zalogowany!</h2>
{:else}
	{#if data.quizzes.length != 0}
		<article>
			<h1>Your quizzes</h1>
			{#each data.quizzes as quiz}
				<nav>
					<hgroup>
						<h3>{quiz.title}</h3>
						{#if quiz.description}
							{quiz.description}
						{:else}
							Your desription
						{/if}
					</hgroup>
					<a href="/me/quizzes/{quiz.id}">
						<button>Edit</button>
					</a>
				</nav>
			{/each}
		</article>
	{/if}

	<article>
		<h2>New Quiz</h2>
		<form action="?/newQuiz" method="post" use:enhance>
			<input type="text" name="quizName" placeholder="Title" />
			<button type="submit">Create Quiz -></button>
		</form>
	</article>
{/if}
