<script lang="ts">
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';
    import type { PageProps } from './$types';
	import { beforeNavigate } from '$app/navigation';

    let { data }: PageProps = $props();
	let dane = $derived(data)

	beforeNavigate(({ cancel }) => {
		if (dane.questions.some(q => q.answers.every(a => !a.isCorrect))
			&& !confirm('Nie ustawiono poprawnej opdowiedzi dla kazdego pytania. Czy napewno chcesz wyjść?')) {
			cancel();
		}
	});

	function handle(questionId: number, answerId: number) {
		dane = {
			...dane,
			questions: dane.questions.map((q) =>
				q.id === questionId
					? {
							...q,
							answers: q.answers.map((a) => ({
								...a,
								isCorrect: a.id === answerId
							}))
					}
					: q
			)
		};
	}
</script>

<article>
	<h1>Edytuj Quiz</h1>
	<form
		method="post"
		action="?/editQuiz"
		use:enhance={({ action }) => {
			if (action.search == '?/editQuiz') return async () => {};
		}}
		onchange={(e) => e.currentTarget.requestSubmit()}
	>
		<input type="hidden" name="quizId" value={dane.id} />
		<input name="title" type="text" placeholder="Tytuł quizu" value={dane.title} />
		<textarea name="description" placeholder="Opis quizu">{dane.description}</textarea>
	</form>
	<form method="post" action="?/deleteQuiz">
		<input type="hidden" name="quizId" value={dane.id} />
		<button class="outline red" type="submit">Usuń quiz</button>
	</form>
</article>

<hr class="fatSeparator" />

{#each dane.questions as question}
	<article>
		<header>
			<form
				class="fatSeparator"
				method="post"
				action="?/editQuestion"
				use:enhance
				onchange={(e) => e.currentTarget.requestSubmit()}
			>
				<input type="hidden" name="questionId" value={question.id} />
				<!-- svelte-ignore a11y_no_redundant_roles -->
				<fieldset role="group" style="margin-bottom: 0;">
					<textarea
						placeholder="Treść odpowiedzi"
						rows="1"
						value={question.content}
						name="newContent"
						style="margin-bottom: 0;"
					></textarea>
					<button formaction="?/deleteQuestion" class="outline red" type="submit">Usuń</button>
				</fieldset>
			</form>
		</header>

		{#if question.answers.every((a) => !a.isCorrect)}
			<div class="centered" style="margin: 1em" transition:slide>
				<small class="red"> To pytanie nie ma ustawionej poprawnej odpowiedzi. </small>
			</div>
		{/if}

		<div class="grid dual">
			{#each question.answers as answer}
				<form
					action="?/editAnswer"
					method="post"
					use:enhance={({ action }) => {
						if (action.search == '?/editAnswer') return async () => {};
					}}
					onchange={(e) => e.currentTarget.requestSubmit()}
				>
					<input type="hidden" name="answerId" value={answer.id} />
					<!-- svelte-ignore a11y_no_redundant_roles -->
					<fieldset role="group">
						<div class="centerSwitch">
							{#if answer.isCorrect}
								<input name="isCorrect" type="checkbox" checked disabled />
							{:else}
								<input name="isCorrect" type="checkbox" onchange={() => handle(question.id, answer.id)} />
							{/if}
						</div>
						<textarea
							placeholder="Treść odpowiedzi"
							rows="1"
							style="resize: none;"
							name="newContent"
							value={answer.content}
						></textarea>
						<button class="outline red" formaction="?/deleteAnswer" type="submit">Usuń</button>
					</fieldset>
				</form>
			{/each}

			{#if question.answers.length <= 5}
				<form action="?/newAnswer" method="post" use:enhance>
					<input type="hidden" name="questionId" value={question.id} />
					<button class="secondary" type="submit">Dodaj odpowiedź +</button>
				</form>
			{/if}
		</div>
	</article>
	<hr class="fatSeparator" />
{/each}

<form method="post" action="?/newQuestion" use:enhance>
	<button type="submit">Dodaj pytanie +</button>
</form>
