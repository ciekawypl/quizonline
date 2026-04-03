<script lang="ts">
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<div class="grid">
	{#if data.hosted.length}
		<div>
			<article>
				<h2>Przeprowadzone quizy</h2>
				{#each data.hosted.reverse() as hosted}
					<nav>
						<hgroup>
							<h4>{hosted.quiz.title}</h4>
							<p>
								{hosted.endedAt.getDate()}.{hosted.endedAt.getMonth() + 1}.{hosted.endedAt.getFullYear()} -
								{hosted.endedAt.getHours()}:{(hosted.endedAt.getMinutes() < 10 ? '0' : '') +
									hosted.endedAt.getMinutes()}
							</p>
						</hgroup>
						<li>
							<a role="button" href="/me/stats/hosted/{hosted.id}">Przejrzyj -></a>
						</li>
					</nav>
				{/each}
			</article>
		</div>
	{/if}
	{#if data.played.length}
		<div>
			<article>
				<h2>Quizy w których brano udział</h2>
				{#each data.played.reverse() as played}
					<nav>
						<hgroup>
							<h4>{played.game.quiz.title}</h4>
							<p>
								{played.game.endedAt.getDate()}.{played.game.endedAt.getMonth() +
									1}.{played.game.endedAt.getFullYear()} -
								{played.game.endedAt.getHours()}:{played.game.endedAt.getMinutes()}
							</p>
						</hgroup>
						<li>
							<a role="button" href="/me/stats/played/{played.id}">Przejrzyj -></a>
						</li>
					</nav>
				{/each}
			</article>
		</div>
	{/if}
</div>

{#if !data.played.length && !data.hosted.length}
	<center class="fatSeparator">
		<hgroup>
			<h2>Pusto...</h2>
			<p>
				Jeżeli ukończyłeś quiz, dokładne wyniki zobaczysz tutaj dopiero po tym jak właściciel quizu go
				zakończy.
			</p>
		</hgroup>
	</center>
{/if}
