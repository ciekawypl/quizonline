<script lang="ts">
    import { Pie } from 'svelte-chartjs';
    import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, plugins } from 'chart.js';
	import type { PageProps } from './$types';

    ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

    let { data }: PageProps = $props()
    let num_of_correct = $derived(data.solutions.filter(solution => solution.is_correct).length)
    let quiz_length = $derived(data.solutions.length)

    const pie_data = {
        labels: ["Poprawne", "Nie poprawne"],
        datasets: [{
            // svelte-ignore state_referenced_locally
            data: [num_of_correct, quiz_length - num_of_correct],
            backgroundColor: ["green", 'red'],
        }]
    }
</script>

<div class="grid grid-1-2">
	<div>
		<center class="fatSeparator">
			<hgroup>
				<h1>Zdobyto {(num_of_correct * 100) / quiz_length}%</h1>
				<h2>Odpowiedziano poprawnie na {num_of_correct} z {quiz_length} pytań</h2>
			</hgroup>
		</center>
		<Pie data={pie_data} options={{ plugins: { legend: { position: 'bottom' } } }} />
	</div>
	<div>
		{#if data.solutions.filter((solution) => solution.is_correct).length != 0}
			<table class="bigMargin">
				<thead>
					<tr>
						<td colspan="2"><h3 style="margin: 0;">Poprane odpowiedzi</h3></td>
					</tr>
				</thead>
				<tbody>
					{#each data.solutions.filter((solution) => solution.is_correct) as solution, index}
						<tr>
							<td>{solution.quetsion_content}</td>
							<td>{solution.answer_content}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}

		{#if data.solutions.filter((solution) => !solution.is_correct && solution.answer_content != undefined).length != 0}
			<table class="bigMargin">
				<thead>
					<tr>
						<td colspan="2"><h3 style="margin: 0;">Niepoprawne odpowiedzi</h3></td>
					</tr>
				</thead>
				<tbody>
					{#each data.solutions.filter((solution) => !solution.is_correct && solution.answer_content != undefined) as solution, index}
						<tr>
							<td>{solution.quetsion_content}</td>
							<td>{solution.answer_content}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}

		{#if data.solutions.filter((solution) => solution.answer_content == undefined).length != 0}
			<table class="bigMargin">
				<thead>
					<tr>
						<td colspan="2"><h3 style="margin: 0;">Nie odpowiedziano</h3></td>
					</tr>
				</thead>
				<tbody>
					{#each data.solutions.filter((solution) => solution.answer_content == undefined) as solution, index}
						<tr>
							<td>{solution.quetsion_content}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>

	<!-- <div>
		<article>
			{#if data.solutions.filter((solution) => solution.is_correct)}
				<h3>Poprawne odpowiedzi</h3>
			{/if}
			{#each data.solutions.filter((solution) => solution.is_correct) as solution, index}
				{#if index != 0}
					<hr style="margin: 0;" />
				{/if}
				<nav>
					<ul><li>{solution.quetsion_content}</li></ul>
					<ul><li>{solution.answer_content}</li></ul>
				</nav>
			{/each}
		</article>

		<article>
			{#if data.solutions.filter((solution) => !solution.is_correct && solution.answer_content != undefined)}
				<h3>Niepoprawne odpowiedzi</h3>
			{/if}

			{#each data.solutions.filter((solution) => !solution.is_correct && solution.answer_content != undefined) as solution, index}
				{#if index != 0}
					<hr style="margin: 0;" />
				{/if}
				<nav>
					<ul><li>{solution.quetsion_content}</li></ul>
					<ul><li>{solution.answer_content}</li></ul>
				</nav>
			{/each}
		</article>

		<article>
			{#if data.solutions.filter((solution) => solution.answer_content == undefined)}
				<h3>Nie odpowiedziano</h3>
			{/if}
			{#each data.solutions.filter((solution) => solution.answer_content == undefined) as solution, index}
				{#if index != 0}
					<hr style="margin: 0;" />
				{/if}
				<nav>
					<ul><li>{solution.quetsion_content}</li></ul>
					<ul><li>{solution.answer_content}</li></ul>
				</nav>
			{/each}
		</article>
	</div> -->
</div>
