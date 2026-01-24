<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let {data}: PageProps = $props()
</script>

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
				<li>
					<a role="button" href="/me/quizzes/{quiz.id}"> Edytuj -> </a>
				</li>
			</nav>
		{/each}
	</article>
{/if}

<article>
	<h2>New Quiz</h2>
	<form action="?/newQuiz" method="post" use:enhance>
		<label>
			Tytuł
			<input type="text" name="quizName" />
		</label>
		<button type="submit">Create Quiz -></button>
	</form>
</article>
