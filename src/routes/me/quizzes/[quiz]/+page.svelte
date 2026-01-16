<script lang="ts">
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<article>
	<form method="post" action="?/editQuiz">
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
		<button type="submit">Save</button>
	</form>
</article>
