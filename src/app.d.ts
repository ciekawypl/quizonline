// See https://svelte.dev/docs/kit/types#app.d.ts

import type { SvelteMap } from "svelte/reactivity";

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
				userId: string,
				sessionId: Int
			} | null;
		}
	}
	type FormError = {
		content: string
		error: string
	} | null
	type Room = {
		id: string
		hostId: string
		players: Player[]
		quiz: QuizLite | null
		status: RoomStatus
	} | undefined
	type RoomStatus =
		| "waiting"
		| "started"
		| "closed"
		| undefined
	type Player = {
		id: string
		nickname: string
		status: PlayerStatus
		solutions: SvelteMap<string, string>
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
		| { type: "kickPlayer", roomId: string, playerId: string}
		| { type: "progressUpdate", roomId: string, questionId: string, answerId: string }
		| { type: "statusUpdate", roomId: string, status: PlayerStatus }
	type ServerMessage =
		| { type: "roomCreated", roomId: string, quizLength: number }
		| { type: "roomClosed" }
		| { type: "roomStarted" }
		| { type: "roomStopped" }
		| { type: "joinedRoom", roomStatus: RoomStatus, quiz: QuizLite | null }
		| { type: "playerJoined", playerId: string, nickname: string, playerStatus: PlayerStatus }
		| { type: "playerProgressUpdate", playerId: string, questionId: string, answerId: string }
		| { type: "playerStatusUpdate", playerId: string, status: PlayerStatus }
		| { type: "error", error_msg: string }
	type QuizLite = {
		id: string
		title: string
		questions: QuestionLite[]
	} | undefined
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
