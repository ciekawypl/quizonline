<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

    let { data }: PageProps = $props()

</script>

<article>
	<div style="text-align: center; padding-top: 32px; padding-bottom: 50px;">
		<strong>
			{data.question?.content}
		</strong>
	</div>

	{#if data.answers}
		{#if data.answers[0]}
			<section>
				<div class="grid">
					<button data-tooltip="test">{data.answers[0].content}</button>
					{#if data.answers[1]}
						<button>{data.answers[1].content}</button>
					{/if}
				</div>
			</section>
		{/if}
		{#if data.answers[2]}
			<div class="grid">
				<button>{data.answers[2].content}</button>
				{#if data.answers[3]}
					<button>{data.answers[3].content}</button>
				{/if}
			</div>
		{/if}
	{/if}
</article>

<article>
	<h2>Edit question</h2>
	<form method="post" action="?/editQuestion" use:enhance>
		<label>
			Content
			<input type="text" name="content" value={data.question?.content} />
		</label>
		<div class="grid">
			<button type="submit">Save</button>
			<button
				formaction="?/deleteQuestion"
				class="outline"
				style="border-color: red; color: red"
				type="submit">Delete</button
			>
		</div>
	</form>
</article>

	<article>
		<h3>New answer</h3>
		<form action="?/newAnswer" method="post" use:enhance>
			<label>
				Answer
				<input type="text" name="content" />
			</label>
			{#if data.answers.length == 4}
				<button disabled type="submit">Add new Answer -></button>
			{:else}
				<button type="submit">Add new Answer -></button>
			{/if}
		</form>
	</article>

	<article>
		<h3>Edit answer</h3>
	</article>
