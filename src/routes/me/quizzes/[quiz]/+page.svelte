<script lang="ts">
	import { enhance } from '$app/forms';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
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
					Quiz Title
					<input name="title" type="text" value={data.quiz?.title} />
				</label>
				<label>
					Quiz description
					<input name="description" type="text" value={data.quiz?.description} />
				</label>
			</fieldset>
			<div class="grid">
				<button type="submit">Save</button>
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
