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
</script>

{#if room}
	<h2>{room.id}</h2>

	{#each room.players as player}
		<p>{player.nickname}</p>
	{/each}
{/if}
