<script>
	import { enhance } from '$app/forms';

	export let data;
</script>

{#if !data.user}
	<h2>Nie jestes zalogowany!</h2>
{:else}
	<h1>Your quizzes</h1>

	<article>
		<h2>New Quiz</h2>
		<form action="?/newQuiz" method="post" use:enhance>
			<input type="text" name="quizName" placeholder="Title" />
			<button type="submit">Create Quiz -></button>
		</form>
	</article>
{/if}
