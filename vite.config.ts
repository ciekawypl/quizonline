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
		ws,
		tailwindcss(), 
		sveltekit()
	]
});
