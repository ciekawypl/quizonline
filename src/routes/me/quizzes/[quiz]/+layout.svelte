<script lang="ts">
	import { enhance } from '$app/forms';
    import type { LayoutProps } from './$types';

    let { data, children }: LayoutProps = $props();
</script>

<div class="grid">
	<div>
		<article>
			<nav>
				<hgroup>
					<h2>{data.quiz?.title}</h2>
					<p>Edit quiz settings</p>
				</hgroup>
				<a href="/me/quizzes/{data.quiz?.id}"> <button>Edit -></button></a>
			</nav>
		</article>

		{#if data.questions.length}
			<article>
				{#each data.questions as question, id}
					<nav>
						{question.content}
						<a href="/me/quizzes/{data.quiz?.id}/{question.id}"><button>Edit -></button></a>
					</nav>
					{#if id != data.questions.length - 1}
						<hr />
					{/if}
				{/each}
			</article>
		{/if}

		<article>
			<h3>New question</h3>
			<form action="/me/quizzes/{data.quiz?.id}?/newQuestion" method="post" use:enhance>
				<label>
					Content
					<input type="text" name="content" />
				</label>
				<button type="submit">Add new question -></button>
			</form>
		</article>
	</div>

	<div>
		{@render children()}
	</div>
</div>
