<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageProps } from "./$types";

    let {data}: PageProps = $props();
</script>

<div>
	<article>
		<h3>Edytuj odpowiedź</h3>
		<form
			action="?/editAnswer"
			method="post"
			use:enhance={() => {
				return async ({ update }) => {
					update({ reset: false });
				};
			}}
		>
			<fieldset>
				<label>
					Treść
					<input name="content" type="text" value={data.answer?.content} />
				</label>
				<label>
					{#if data.answer?.isCorrect}
						<input name="isCorrect" type="checkbox" role="switch" checked />
					{:else if !data.answer?.isCorrect}
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