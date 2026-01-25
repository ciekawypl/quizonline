<script lang="ts">
	import { enhance } from '$app/forms';
    import type { LayoutProps } from './$types';

    let { data, children }: LayoutProps = $props();

	let contentError = $state<FormError>()
	let success = $state(false)
</script>

<article>
	<nav>
		<hgroup>
			<h2>{data.quiz?.title}</h2>
			<p>Edytuj quiz</p>
		</hgroup>
		<li>
			<a role="button" data-sveltekit-noscroll href="/me/quizzes/{data.quiz?.id}"> Edytuj -></a>
		</li>
	</nav>
</article>

<div class="grid grid-1-2">
	<div>
		<article>
			<h3>Nowe Pytanie</h3>
			<!-- svelte-ignore component_name_lowercase -->
			<form
				action="/me/quizzes/{data.quiz?.id}?/newQuestion"
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
							<input type="text" name="content" aria-invalid="true" value={contentError.content} />
							<small>{contentError.error}</small>
						{:else if success}
							<input type="text" name="content" aria-invalid="false" />
						{:else}
							<input type="text" name="content" />
						{/if}
					</label>
				</fieldset>
				<button type="submit">Dodaj pytanie -></button>
			</form>
		</article>

		<div>
			{#if data.quiz.questions.length}
				<article>
					<h3>Wszystkie pytania</h3>
					{#each data.quiz.questions as question, id}
						<nav>
							<li>
								{question.content}
							</li>
							<li>
								<a
									role="button"
									href="/me/quizzes/{data.quiz?.id}/{question.id}"
									data-sveltekit-noscroll>Edytuj -></a
								>
							</li>
						</nav>
						{#if id != data.quiz.questions.length - 1}
							<hr style="margin-top: 0px;" />
						{/if}
					{/each}
				</article>
			{/if}
		</div>
	</div>

	{@render children()}
</div>
