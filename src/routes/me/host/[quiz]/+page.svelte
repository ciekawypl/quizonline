<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { browser } from "$app/environment";
	import type { PageProps } from "./$types";
	import { SvelteMap } from "svelte/reactivity";
	import { beforeNavigate } from "$app/navigation";

	let { params }: PageProps = $props()

    let ws: WebSocket | null = null

	let roomId: string | undefined = $state()
	let gameId: string | undefined = $state()
	let roomStatus: RoomStatus = $state()
	let players: Player[] = $state([])
	let quizLength = $state()
	
	beforeNavigate(({ cancel }) => {
		if (roomStatus != "closed" && !confirm('Twoj quiz nie został zakończony. Wyniki nie zostaną zapisane. Czy na pewno chcesz wyjść?')) {
			cancel();
		}
  	});

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
				case "roomCreated": {
					roomStatus = "waiting"
					roomId = message.roomId
					quizLength = message.quizLength
					break
				}
				case "roomStarted": {
					roomStatus = "started"
					break
				}
				case "roomStopped" : {
					roomStatus = "closed"
					gameId = message.gameId
					break
				}
				case "playerJoined": {
					const player: Player = {
						id: message.playerId,
						userId: null,
						nickname: message.nickname,
						status: message.playerStatus,
						solutions: new SvelteMap()
					}
					players.push(player)
					break
				}
				case "playerProgressUpdate": {
					const player = players.find(player => player.id === message.playerId)
					if (player) player.solutions.set(message.questionId, "")
					break
				}
				case "playerStatusUpdate": {
					const player = players.find(player => player.id === message.playerId)
					if (player) player.status = message.status
					break
				}
				case "error": {
					break
				}
			}
		}

		ws.onclose = () => {
		}
	});
	
	onDestroy(() => {
		if (!roomId) return
		send({
			type: "closeRoom",
			roomId: roomId
		})
		ws?.close();
	});

	function send(command: ClientMessage) {
		ws?.send(JSON.stringify(command))
	}

	function startQuiz() {
		if (!roomId) return

		send({
			type: "startRoom",
			roomId: roomId
		})
	}

	function stopQuiz() {
		if (!roomId) return
		
		let someoneStillPlaying = false
		for (let i = 0; i < players.length; i++) {
			if (players[i].status === "started") {
				someoneStillPlaying = true
				break
			}
		}

		if (someoneStillPlaying) {
			if (!window.confirm("Nie wszyscy jeszcze ukończyli, czy na pewno chcesz zakończyć quiz?")) {
				return
			}
		}

		send({
			type: "stopRoom",
			roomId: roomId
		})
	}

	function kickPlayer(playerId: string) {
		if (!roomId) return

		send({
			type: "kickPlayer",
			roomId: roomId,
			playerId: playerId
		})

		const index = players.findIndex(player => player.id === playerId)
		const lastIndex = players.length - 1;
		if (index < lastIndex) {
			players[index] = players[lastIndex];
		}
		players.pop();
	}
</script>

{#if roomId}
	<div class="grid">
		<article class="tall centered">
			<hgroup style="margin: 0;">
				<h1>{roomId}</h1>
				<p>Kod twojego quizu</p>
			</hgroup>
		</article>
		<article class="keepPadding">
			<div class="tall centered">
				<hgroup style="margin: 0">
					{#if roomStatus == 'waiting'}
						<h2>Poczekalnia</h2>
						<p>Twój quiz czeka na rozpoczęcie. Uczestnicy są w stanie do niego od teraz dołączyć.</p>
					{:else if roomStatus == 'started'}
						<h2>W trakcie</h2>
						<p>Twój quiz się rozpoczął i jest teraz rozwiązywany przez uczestników.</p>
					{:else if roomStatus == 'closed'}
						<h2>Zakończony</h2>
						<p>Twój quiz się zakończył. Nie da się do niego teraz dołączyć.</p>
					{/if}
				</hgroup>
			</div>
			<div class="grid">
				{#if roomStatus == 'waiting'}
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
				{:else if roomStatus == 'started'}
					<button
						class="outline red"
						onclick={() => {
							stopQuiz();
						}}>Zakończ quiz</button
					>
				{:else if roomStatus == 'closed'}
					<a role="button" href="/me/stats{gameId ? '/hosted/' + gameId : ''}">Sprawdź wyniki -></a>
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
				<th style="width: 10%;">Akcje</th>
			</tr>
		</thead>
		<tbody>
			{#each players.values() as player}
				<tr>
					<th>{player.nickname}</th>
					{#if player.status == 'waiting'}
						<th>Czeka</th>
					{:else if player.status == 'started'}
						<th>Rozwiązuje</th>
					{:else if player.status == 'ended'}
						<th>Ukończył</th>
					{:else if player.status == 'left'}
						<th>Wyszedł</th>
					{/if}
					<th>{player.solutions.size}/{quizLength}</th>
					<th>
						<button class="slim red outline" onclick={() => kickPlayer(player.id)}>Wyproś</button>
					</th>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
