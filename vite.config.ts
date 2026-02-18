import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { getWebSocketManager, webSocketServer, type WSMessage } from 'sveltekit-ws';
import { randomInt } from 'crypto';
import db from './src/lib/server/db';
import ws from './src/lib/server/ws';

interface room {
	quizId: string,
	host: string,
	players: string[]
}

const rooms: Map<string, room> = new Map

export default defineConfig({
	plugins: [
	// 	webSocketServer({
	// 	path: "/ws",
	// 	handlers: {
	// 		onConnect: (connection) => {
	// 		},

	// 		onMessage: async (connection, message) => {
	// 			if (message.type == "host") {
	// 				const manager = getWebSocketManager()
	// 				const roomId = randomInt(100000, 999999).toString()
	// 				const quiz = await db.quiz.findUnique({
	// 					where: { id: message.data }
	// 				})

	// 				rooms.set(roomId, { quizId: quiz!.id, host: connection.id, players: [] })

	// 				manager.send(connection.id, { type: "roomId", data: roomId })
	// 			}
	// 			if (message.type == "connect") {
	// 				const manager = getWebSocketManager()
	// 				const room = rooms.get(message.data)
	// 				const quiz = await db.quiz.findUnique({
	// 					where: { id: room?.quizId }
	// 				})

	// 				manager.send(connection.id, { type: "quizData", data: quiz })
	// 				room?.players.push(connection.id)
	// 				manager.send(room!.host, {type: "players", data: room?.players.length})
	// 			}
	// 			if (message.type == "disconnect") {
	// 				const room = rooms.get(message.data)
					
	// 			}
	// 		},

	// 		onDisconnect: (connection) => {
	// 		},
	// 	},
	// }),
	ws,
	tailwindcss(), sveltekit()]
});
