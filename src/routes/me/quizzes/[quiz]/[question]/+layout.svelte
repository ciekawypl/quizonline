<script lang="ts">
	import { enhance } from '$app/forms';
    import type { LayoutProps } from './$types';

    let { data, children }: LayoutProps = $props();

	let contentError = $state<FormError>()
	let success = $state(false)
</script>

<div>
	<article class="cutbot">
		<nav>
			<hgroup>
				<h3>{data.question.content}</h3>
				<p>Edytuj to pytanie -></p>
			</hgroup>
			<li>
				<a
					data-sveltekit-noscroll
					role="button"
					href="/me/quizzes/{data.quiz?.id}/{data.question?.id}">Edytuj -></a
				>
			</li>
		</nav>
	</article>

	<div class="grid">
		<div>
			<article>
				<h3>Nowa odpowiedź</h3>
				<!-- svelte-ignore component_name_lowercase -->
				<form
					action="/me/quizzes/{data.quiz?.id}/{data.question?.id}?/newAnswer"
					method="post"
					use:enhance={({ formElement }) => {
						return async ({ result, update }) => {
							if (result.type === 'failure') {
								contentError = result.data!.contentError as FormError;
								success = false;
							} else {
								formElement.reset();
								contentError = null;
								success = true;
								update();
							}
						};
					}}
				>
					<fieldset>
						<label>
							Treść
							{#if contentError}
								<input
									type="text"
									name="content"
									aria-invalid="true"
									value={contentError.content}
								/>
								<small>{contentError.error}</small>
							{:else if success}
								<input type="text" name="content" aria-invalid="false" value="" />
							{:else}
								<input type="text" name="content" />
							{/if}
						</label>
						<label>
							<input name="isCorrect" type="checkbox" role="switch" />
							Poprawna odpowiedź
						</label>
					</fieldset>
					<button type="submit">Dodaj nową odpowiedź -></button>
				</form>
			</article>

			{#if data.answers?.length ?? 0 > 0}
				<article>
					<h3>Wszystkie odpowiedzi</h3>
					{#each data.answers as answer, id}
						<nav>
							<li>
								{#if answer.isCorrect}
									<span style="color: green;"> ● </span>
								{:else}
									<span style="color: #b90e0e;"> ● </span>
								{/if}
								{answer.content}
							</li>

							<li>
								<a
									role="button"
									href="/me/quizzes/{data.quiz?.id}/{data.question?.id}/{answer.id}"
									data-sveltekit-noscroll
								>
									Edytuj ->
								</a>
							</li>
						</nav>
						{#if id != (data.answers?.length ?? 0) - 1}
							<hr style="margin-top: 0px;" />
						{/if}
					{/each}
				</article>
			{/if}
		</div>

		{@render children()}
	</div>
</div>
