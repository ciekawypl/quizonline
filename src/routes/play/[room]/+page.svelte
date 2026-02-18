<script lang="ts">
	import { browser } from "$app/environment";
	import { onDestroy, onMount } from "svelte";
	import type { PageProps } from "./$types";

    let { params }: PageProps = $props()

    let ws: WebSocket | null = null

	let room : Room = $state()

    onMount(() => {
        if (!browser) return;
		
		ws = new WebSocket(`ws://${window.location.host}/ws`);

        ws.onopen = () => {
            send({
                type: "joinRoom",
                roomId: params.room
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
    })

    onDestroy(() =>{
        send({
            type: "leaveRoom",
            roomId: params.room
        })
        ws?.close()
    })

    function send(command: ClientMessage) {
		ws?.send(JSON.stringify(command))
	}
</script>

{#if room}
	witamy w {room.id} <br>
    status: {room.status}
{:else}
	pusto
{/if}
