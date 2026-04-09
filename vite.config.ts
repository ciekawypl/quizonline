import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import ws from './src/lib/server/ws';

export default defineConfig({
	plugins: [
		ws,
		tailwindcss(), 
		sveltekit()
	]
});
