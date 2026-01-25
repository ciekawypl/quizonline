<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageProps } from "./$types";

    let { data, form }: PageProps = $props();
</script>

<div>
	<article>
		<h3>Edytuj odpowiedź</h3>
		<form action="?/editAnswer" method="post" use:enhance>
			<fieldset>
				<label>
					Treść
					{#if form?.contentError}
						<input
							name="content"
							type="text"
							value={form.contentError.newContent}
							aria-invalid="true"
						/>
						<small>{form.contentError.error}</small>
					{:else if form?.success}
						<input name="content" type="text" aria-invalid="false" value={data.answer.content} />
					{:else}
						<input name="content" type="text" value={data.answer?.content} />
					{/if}
				</label>
				<label>
					{#if data.answer?.isCorrect}
						<input name="isCorrect" type="checkbox" role="switch" checked />
					{:else}
						<input name="isCorrect" type="checkbox" role="switch" />
					{/if}
					Poprawna odpowiedź
				</label>
			</fieldset>
			<div class="grid">
				<button type="submit">Zapisz</button>
				<button
					formaction="?/deleteAnswer"
					class="outline"
					style="border-color: red; color: red"
					type="submit">Usuń</button
				>
			</div>
		</form>
	</article>
</div>
