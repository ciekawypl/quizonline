import type { Handle } from '@sveltejs/kit'
import db from '$lib/server/db'
import { createHash } from 'crypto'

export const handle: Handle = async ({ event, resolve }) => {
    const session_id = event.cookies.get('session')

    if (!session_id) {
        return await resolve(event)
    }

    const session_hash = createHash('sha256').update(session_id).digest('hex')

    const session = await db.session.findUnique({
        where: { session_hash: session_hash },
        select: { username: true, userId: true, id: true }
    })

    if (session) {
        event.locals.user = {
            username: session.username,
            userId: session.userId,
            sessionId: session.id
        }
    }

    return await resolve(event)
}