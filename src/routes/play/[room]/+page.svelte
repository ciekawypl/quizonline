<script lang="ts">
	import { browser } from "$app/environment";
	import { onDestroy, onMount } from "svelte";
	import type { PageProps } from "./$types";
	import { enhance } from "$app/forms";

    let { params, data, form }: PageProps = $props()

	let room : Room = $state()
    let error: String|null = $state(null)

    let ws: WebSocket | null = null

    $effect(() => {
        if(form?.validName) {
            send({
                type:"joinRoom",
                roomId: params.room,
                nickname: form.validName
            })
            
        }
    })

    onMount(() => {
        if (!browser) return;
		
		ws = new WebSocket(`ws://${window.location.host}/ws`);

        ws.onopen = () => {
            send({
                type: "checkForRoom",
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
                case "error": {
                    error = message.error
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

{#if error}
	{error}
{:else if !room}
	<article>
		<h2>Wpisz swoje imię</h2>
		<form action="?/setName" method="post" use:enhance>
			<fieldset>
				<input
					placeholder="Imię"
					name="nickname"
					type="text"
					value={data.username}
					aria-invalid={form?.error ? 'true' : 'grammar'}
				/>
				{#if form?.error}
					<small>{form.error}</small>
				{/if}
			</fieldset>
			<button type="submit">Przejdż dalej -></button>
		</form>
	</article>
{:else if room.status == 'waiting'}
	czekamy
{:else if room.status == 'closed'}
	Pokój został zamknięty
{/if}
