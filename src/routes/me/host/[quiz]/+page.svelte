<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { browser } from "$app/environment";
	import type { PageProps } from "./$types";

	let { params }: PageProps = $props()

    let ws: WebSocket | null = null

	let room : Room = $state()

	onMount(() => {
		if (!browser) return;
		
		ws = new WebSocket(`ws://${window.location.host}/ws`);

		ws.onopen = () => {
			send({
				type: "createRoom",
				quizId: params.quiz
			})
		}

		ws.onmessage = (event) => {
			const message : ServerMessage = JSON.parse(event.data);

			switch (message.type) {
				case "roomState": {
					room = message.room
					break;
				}
			}
		}

		ws.onclose = () => {
		}
	});
	
	onDestroy(() => {
		if (!room) return
		send({
			type: "closeRoom",
			roomId: room?.id
		})
		ws?.close();
	});

	function send(command: ClientMessage) {
		ws?.send(JSON.stringify(command))
	}

	function startQuiz() {
		if (!room) return

		send({
			type: "startRoom",
			roomId: room.id
		})
	}

	function stopQuiz() {
		if (!room) return
		
		send({
			type: "stopRoom",
			roomId: room.id
		})
	}
</script>

{#if room}
	<!-- <center class="fatSeparator">
		<hgroup>
			<h1>{room.id}</h1>
			<p>Kod twojego quizu</p>
		</hgroup>
	</center> -->

	<div class="grid">
		<article class="tall centered">
			<hgroup style="margin: 0;">
				<h1>{room.id}</h1>
				<p>Kod twojego quizu</p>
			</hgroup>
		</article>
		<article class="keepPadding">
			<div class="tall centered">
				<hgroup style="margin: 0">
					{#if room.status == 'waiting'}
						<h2>Poczekalnia</h2>
						<p>Twój quiz czeka na rozpoczęcie. Uczestnicy są w stanie do niego od teraz dołączyć.</p>
					{:else if room.status == 'started'}
						<h2>W trakcie</h2>
						<p>Twój quiz się rozpoczął i jest teraz rozwiązywany przez uczestników.</p>
					{:else if room.status == 'closed'}
						<h2>Zakończony</h2>
						<p>Twój quiz się zakończył. Nie da się do niego teraz dołączyć.</p>
					{/if}
				</hgroup>
			</div>
			<div class="grid">
				{#if room.status == 'waiting'}
					<button
						class="secondary"
						onclick={() => {
							startQuiz();
						}}>Rozpocznij quiz</button
					>
					<button
						class="outline red"
						onclick={() => {
							stopQuiz();
						}}>Zakończ quiz</button
					>
				{:else if room.status == 'started'}
					<button
						class="outline red"
						onclick={() => {
							stopQuiz();
						}}>Zakończ quiz</button
					>
				{:else if room.status == 'closed'}
					<button>Sprawdź wyniki -></button>
				{/if}
			</div>
		</article>
	</div>

	<table class="overflow-auto">
		<thead>
			<tr>
				<th>Uczestnik</th>
				<th>Status</th>
				<th>Postęp</th>
				<th>Akcje</th>
			</tr>
		</thead>
		<tbody>
			{#each room.players as player}
				<tr>
					<th>{player.nickname}</th>
					{#if player.status == 'waiting'}
						<th>Czeka</th>
					{:else if player.status == 'started'}
						<th>Rozwiązuje</th>
					{:else if player.status == 'ended'}
						<th>Zakończył</th>
					{:else if player.status == 'left'}
						<th>Wyszedł</th>
					{/if}
					<th>{player.progress_count}/{room.quiz?.questions.length}</th>
					<th style="width: 1%;">
						<button class="slim red outline">Wyproś</button>
					</th>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
