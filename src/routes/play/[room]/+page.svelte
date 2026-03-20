<script lang="ts">
	import { browser } from "$app/environment";
	import { onDestroy, onMount } from "svelte";
	import type { PageProps } from "./$types";
	import { enhance } from "$app/forms";

    let { params, data, form }: PageProps = $props()

	let room : Room = $state()
	let progress: Record<string, String> = {}
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
					if (!room) {
						if (!message.room) return
						shuffle(message.room.quiz!.questions)
						message.room.quiz?.questions.forEach(element => {
							shuffle(element.answers)
						})

						room = message.room
					} else {
						room.status = message.room!.status
					}
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

	function shuffle(array: any[]) {
		for (let i = array.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}

	function trackProgress(questionId: string, answerId: String) {
		if (!progress[questionId]) {
			send({
				type: "progressUpdate",
				roomId: room!.id
			})
		}

		progress[questionId] = answerId
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
{:else if room.status == 'started'}
	<center style="margin-bottom: 3rem;">
		<h1>{room.quiz?.title}</h1>
	</center>

	{#each room.quiz?.questions as question}
		<article>
			<header>
				<center class="fatSeparator">
					<h4>{question.content}</h4>
				</center>
			</header>

			<div class="grid dual">
				{#each question.answers as answer}
					<!-- svelte-ignore a11y_no_redundant_roles -->
					<label style="width: 100%;" onchange={() => trackProgress(String(question.id), String(answer.id))}>
						<fieldset role="group">
							<div class="centerSwitch">
								<input type="radio" name={String(question.id)} />
							</div>
							<div style="width: 100%;" class="answer">{answer.content}</div>
						</fieldset>
					</label>
				{/each}
			</div>
		</article>
		<hr class="fatSeparator" />
	{/each}
{/if}
