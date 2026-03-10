// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface Locals {
			user: {
				userId: String,
				sessionId: Int
			} | null;
		}
	}
	type FormError = {
		content: String
		error: String
	} | null
	type Room = {
		id: string
		quizId: string
		hostId: string
		players: Player[]
		status:
		| "waiting"
		| "started"
		| "closed"
	} | undefined
	type Player = {
		id: string
		nickname: string
	}
	type ClientMessage =
		| { type: "createRoom", quizId: string }
		| { type: "closeRoom", roomId: string }
		| { type: "joinRoom", roomId: string, nickname: string }
		| { type: "leaveRoom", roomId: string }
		| { type: "checkForRoom", roomId: string }
	type ServerMessage =
		| { type: "roomState", room: Room }
		| { type: "error", error: string }
}

export { };
