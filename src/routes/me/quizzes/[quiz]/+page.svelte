<script lang="ts">
	import { enhance } from '$app/forms';
    import type { PageProps } from './$types';

    let { data, form }: PageProps = $props();
</script>

<div>
	<article>
		<h3>Edytuj quiz</h3>
		<form
			method="post"
			action="?/editQuiz"
			use:enhance={() => {
				return async ({ update }) => {
					update({ reset: false });
				};
			}}
		>
			<fieldset>
				<label>
					Tytuł
					{#if form?.newTitleError}
						<input
							name="title"
							type="text"
							value={form.newTitleError.newTitle}
							aria-invalid="true"
						/>
						<small>{form.newTitleError.error}</small>
					{:else if form?.success}
						<input name="title" type="text" value={data.quiz?.title} aria-invalid="false" />
					{:else}
						<input name="title" type="text" value={data.quiz?.title} />
					{/if}
				</label>
				<label>
					Opis
					{#if form?.newDescriptionError}
						<input
							name="description"
							type="text"
							value={form.newDescriptionError.newDescription}
							aria-invalid="true"
						/>
						<small>{form.newDescriptionError.error}</small>
					{:else if form?.success}
						<input
							name="description"
							type="text"
							value={data.quiz?.description}
							aria-invalid="false"
						/>
					{:else}
						<input name="description" type="text" value={data.quiz?.description} />
					{/if}
				</label>
			</fieldset>
			<div class="grid">
				<button type="submit">Zapisz</button>
				<button
					formaction="?/deleteQuiz"
					class="outline"
					style="border-color: red; color: red"
					type="submit">Usuń</button
				>
			</div>
		</form>
	</article>
</div>
