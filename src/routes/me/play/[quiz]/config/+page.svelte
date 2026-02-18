<script lang="ts">
	import type { PageProps } from "./$types";

    let { data }: PageProps = $props()

    let isTimeBased = $state(false)
</script>

<article>
	<h2>Rozpocznij quiz</h2>
	<form method="POST" action="?/startQuiz">
		<label>
			Nazwa quizu do wyświetlania:
			<input name="title" type="text" value={data.quiz.title} />
		</label>
		<label>
			<input name="isLoginRequired" type="checkbox" role="switch" />
			Tylko dla zalogowanych
		</label>

		<hr />

		<legend>Forma przeprowadzania quizu:</legend>
		<label>
			<input
				value="userBased"
				type="radio"
				onclick={() => (isTimeBased = false)}
				name="quizStyle"
				checked
			/>
			Pytania przeklikuje rozwiązujący
		</label>
		<label>
			<input
				value="hostBased"
				type="radio"
				onclick={() => (isTimeBased = false)}
				name="quizStyle"
			/>
			Pytania przeklikuje właściciel quizu
		</label>
		<label>
			<input value="timeBased" type="radio" onclick={() => (isTimeBased = true)} name="quizStyle" />
			Pytania są na czas
		</label>

		<hr />

		<label aria-disabled={!isTimeBased}>
			Jedno pytanie trwa:
			<input name="time" type="number" min="1" max="1800" value="30" />
			<small>sekund</small>
		</label>

		<button type="submit">Rozpocznij -></button>
	</form>
</article>
