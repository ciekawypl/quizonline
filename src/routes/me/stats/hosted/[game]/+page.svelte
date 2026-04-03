<script lang="ts">
    import type { PageProps } from './$types';
    import { Bar } from 'svelte-chartjs';
    import {
        Chart as ChartJS,
        Title, Tooltip, Legend,
        BarElement, CategoryScale, LinearScale, Colors
    } from 'chart.js';
    
    ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);
    
    let { data }: PageProps = $props();

    const chart_data = {
        // svelte-ignore state_referenced_locally
		labels: data.game.players.map(p => p.name),
        datasets: [{
            label: 'Wynik',
            // svelte-ignore state_referenced_locally
			data: data.game.players.map(p => p.score),
            backgroundColor: ["#f56b3d"],
        borderWidth: 2,
        }],
    };
</script>

<div class="grid grid-1-2">
	<article class="keepPadding">
		<hgroup>
			<h2>{data.game.title}</h2>
			<p>Informacje o quizie</p>
		</hgroup>
		<p>Ilość uczestników: {data.game.players.length}</p>
		<p>
			Średni wynik: {Math.round(
				data.game.players.map((p) => p.score).reduce((a, b) => a + b) / data.game.players.length
			)}%
		</p>
		<p>
			Mediana wyników: {Math.round(
				data.game.players.length % 2
					? data.game.players[(data.game.players.length - 1) / 2].score
					: data.game.players.map((p) => p.score).reduce((a, b) => a + b) / data.game.players.length
			)}%
		</p>
		<p>Najwyższy wynik: {Math.max(...data.game.players.map((p) => p.score))}%</p>
		<p>Najniższy wynik: {Math.min(...data.game.players.map((p) => p.score))}%</p>
	</article>
	<div>
		<Bar data={chart_data} options={{ responsive: true }} />
	</div>
</div>

<table>
	<thead>
		<tr>
			<td>Uczestnik</td>
			<td>Punkty</td>
			<td>Wynik</td>
		</tr>
	</thead>
	<tbody>
		{#each data.game.players as player}
			<tr>
				<td>{player.name}</td>
				<td>{player.points}</td>
				<td>{player.score}%</td>
			</tr>
		{/each}
	</tbody>
</table>
