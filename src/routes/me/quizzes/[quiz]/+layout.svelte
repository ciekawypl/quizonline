<script lang="ts">
	import { enhance } from '$app/forms';
    import type { LayoutProps } from './$types';

    let { data, children }: LayoutProps = $props();
</script>

<article>
	<nav>
		<hgroup>
			<h2>{data.quiz?.title}</h2>
			<p>Edit quiz settings</p>
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
			<form action="/me/quizzes/{data.quiz?.id}?/newQuestion" method="post" use:enhance>
				<label>
					Content
					<input type="text" name="content" />
				</label>
				<button type="submit">Add new question -></button>
			</form>
		</article>

		<div>
			{#if data.questions.length}
				<article>
					<h3>Wszystkie pytania</h3>
					{#each data.questions as question, id}
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
						{#if id != data.questions.length - 1}
							<hr style="margin-top: 0px;"/>
						{/if}
					{/each}
				</article>
			{/if}
		</div>
	</div>

	{@render children()}
</div>
