import db from '$lib/server/db'
import { redirect, type Actions } from '@sveltejs/kit'
import { createHash } from 'crypto'

export const actions: Actions = {
    default: async ({ cookies }) => {
        const session_id = cookies.get('session')

        if (session_id) {
            const session_hash = createHash('sha256').update(session_id).digest('hex')

            await db.session.delete({
                where: { session_hash: session_hash }
            })

            cookies.delete('session', { path: "/" })
        }

        redirect(302, '/')
    }
};