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
		hostId: string
		players: Player[]
		quiz: QuizLite
		status:
		| "waiting"
		| "started"
		| "closed"
	} | undefined
	type Player = {
		id: string
		nickname: string
		status: PlayerStatus
		progress_count: number
	}
	type PlayerStatus =
		| "waiting"
		| "started"
		| "ended"
		| "left"
	type ClientMessage =
		| { type: "createRoom", quizId: string }
		| { type: "closeRoom", roomId: string }
		| { type: "joinRoom", roomId: string, nickname: string }
		| { type: "leaveRoom", roomId: string }
		| { type: "checkForRoom", roomId: string }
		| { type: "startRoom", roomId: string }
		| { type: "stopRoom", roomId: string }
		| { type: "progressUpdate", roomId: string }
		| { type: "statusUpdate", roomId: string, status: PlayerStatus }
	type ServerMessage =
		| { type: "roomState", room: Room }
		| { type: "error", error: string }
	type QuizLite = {
		id: string
		title: string
		questions: QuestionLite[]
	} | null
	type QuestionLite = {
		id: number
		content: string
		answers: AnswerLite[]
	}
	type AnswerLite = {
		id: number
		content: string
		checked?: boolean
	}
}

export { };
