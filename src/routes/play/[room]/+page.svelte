<script lang="ts">
	import { browser } from "$app/environment";
	import { onDestroy, onMount } from "svelte";
	import type { PageProps } from "./$types";
	import { enhance } from "$app/forms";
	import { beforeNavigate } from "$app/navigation";

    let { params, data, form }: PageProps = $props()

	let roomStatus: RoomStatus = $state()
	let quiz: QuizLite | null = $state()
	let score: number | undefined = $state()
    let error: string = $state("")
	let progress: Set<string> = new Set<string>()
	
    let ws: WebSocket | null = null

	beforeNavigate(({ cancel }) => {
		if (roomStatus == "started") {
			if (score === undefined && !confirm('Nie zatwierdziłeś. Wyniki mogą nie być zapisane. Czy na pewno chcesz wyjść?')) {
				cancel();
			}
		}
  	});
	
    $effect(() => {
        if(form?.validName) {
            send({
                type:"joinRoom",
                roomId: params.room,
                nickname: form.validName,
				userId: data.user?.userId ?? null
            })
        }
    })

	$effect(() =>{
		if (roomStatus == "started") {
			send({
				type: "statusUpdate",
				roomId: params.room,
				status: "started"
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
				case "joinedRoom": {
					quiz = message.quiz
					if (quiz){
						shuffle(quiz.questions)
						quiz.questions.forEach(question => {
							shuffle(question.answers)
						})
					}
					roomStatus = message.roomStatus
					break
				}
				case "roomClosed": {
					roomStatus = "closed"
					break
				}
				case "roomStarted": {
					roomStatus = "started"
					break
				}
				case "roomStopped": {
					roomStatus = "closed"
					break
				}
				case "playerScore": {
					score = message.score
					break
				}
                case "error": {
                    error = message.error_msg
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

	function trackProgress(questionId: string, answerId: string) {
		progress.add(questionId)
		send({
			type: "progressUpdate",
			roomId: params.room,
			questionId: questionId,
			answerId: answerId
		})
	}

	function sendSolution() {
		if (progress.size !== quiz?.questions.length) {
			if (!window.confirm("Nie odpowiedziano na wszystkie pytania, czy na pewno chcesz zatwierdzić?")) {
				return
			}
		}

		send({
			type: "statusUpdate",
			status: "ended",
			roomId: params.room
		})
	}
</script>

{#if score !== undefined}
	<center class="fatSeparator">
		<hgroup>
			<h1>Zdobyto {(score * 100) / quiz!.questions.length}%</h1>
			<h2>Odpowiedziano poprawnie na {score} z {quiz?.questions.length} pytań</h2>
		</hgroup>
		{#if data.user}
			<p>Statystyki zaktualizują się po zakończeniu quizu</p>
		{/if}
		<a href="/" role="button" class="secondary">Wróć na strone główną -></a>
	</center>
{:else if error !== ''}
	<center class="fatSeparator">
		<h1>{error}</h1>
		<a href="/" role="button" class="secondary">Wróć na strone główną -></a>
	</center>
{:else if !roomStatus}
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
{:else if roomStatus == 'waiting'}
	<center class="fatSeparator">
		<h1>Quiz wkrótce się rozpocznie...</h1>
	</center>
{:else if roomStatus == 'closed'}
	<center class="fatSeparator">
		<h1>Quiz został zakończony</h1>
		<a href="/" role="button" class="secondary">Wróć na strone główną -></a>
	</center>
{:else if roomStatus == 'started'}
	<center style="margin-bottom: 3rem;">
		<h1>{quiz?.title}</h1>
	</center>

	{#each quiz?.questions as question}
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

	<button type="submit" onclick={() => sendSolution()}>Zatwierdź odpowiedzi</button>
{/if}
