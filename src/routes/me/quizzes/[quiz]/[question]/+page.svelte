<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageProps } from "./$types";

    let { data, form } : PageProps = $props()
</script>

<div>
	<article>
		<h3>Edytuj pytanie</h3>
		<form
			method="post"
			action="/me/quizzes/{data.quiz?.id}/{data.question?.id}?/editQuestion"
			use:enhance
		>
			<label>
				Treść
				{#if form?.contentError}
					<input
						type="text"
						name="content"
						value={form.contentError.newContent}
						aria-invalid="true"
					/>
					<small>{form.contentError.error}</small>
				{:else if form?.success}
					<input type="text" name="content" value={data.question?.content} aria-invalid="false" />
				{:else}
					<input type="text" name="content" value={data.question?.content} />
				{/if}
			</label>
			<div class="grid">
				<button type="submit">Zapisz</button>
				<button
					formaction="/me/quizzes/{data.quiz?.id}/{data.question?.id}?/deleteQuestion"
					class="outline"
					style="border-color: red; color: red"
					type="submit">Usuń</button
				>
			</div>
		</form>
	</article>
</div>
