<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let {data, form}: PageProps = $props()
</script>

{#if data.quizzes.length != 0}
	<article>
		<h1>Twoje quizy</h1>
		{#each data.quizzes as quiz}
			<nav>
				<hgroup>
					<h3>{quiz.title}</h3>
					{#if quiz.description}
						{quiz.description}
					{:else}
						Twój opis
					{/if}
				</hgroup>
				<li>
					<a class="secondary" role="button" href="/me/quizzes/{quiz.id}"> Edytuj </a>
					<a role="button" href="/me/host/{quiz.id}"> Rozpocznij -> </a>
				</li>
			</nav>
		{/each}
	</article>
{/if}

<article>
	<h2>Nowy quiz</h2>
	<form action="?/newQuiz" method="post" use:enhance>
		<label>
			Tytuł
			{#if form?.errorTooLong}
				<input type="text" name="quizName" aria-invalid="true" value={form.quizName ?? ''} />
				<small>{form.errorTooLong}</small>
			{:else if form?.errorBlank}
				<input type="text" name="quizName" aria-invalid="true" />
				<small>{form.errorBlank}</small>
			{:else}
				<input type="text" name="quizName" />
			{/if}
		</label>
		<button type="submit">Stwórz quiz -></button>
	</form>
</article>
