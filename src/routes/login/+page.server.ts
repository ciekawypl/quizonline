import bcrypt from 'bcrypt'
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

import db from "$lib/server/db"
import { createHash } from 'crypto';

export const actions: Actions = {
    login: async ({ request, cookies }) => {
        const data = await request.formData()
        const username = data.get('username')?.toString().trim()
        const password = data.get('password')?.toString().trim()

        if (!username || username == "") return fail(400, { usernameError: { username, error: "Pole nie może być puste" } })

        if (!password || password == "") return fail(400, { passwordError: { username, error: "Pole nie może być puste" } })

        const user = await db.user.findUnique({
            where: {
                username: String(username),
            }
        })

        if (!user) return fail(400, { globalError: { username, error: "Nie poprawny użytkownik lub hasło" } })

        const valid = await bcrypt.compare(String(password)!, user.password_hash)

        if (!valid) return fail(400, { globalError: { username, error: "Nie poprawny użytkownik lub hasło" } })


        const session_id = crypto.randomUUID()
        const session_hash = createHash("sha256").update(session_id).digest('hex')

        await db.session.create({
            data: {
                userId: String(user.id),
                session_hash: session_hash
            }
        })

        cookies.set("session", session_id, { path: "/", secure: true, maxAge: 60 * 60 * 24 * 30 })

        redirect(300, "/")
    },

    register: async ({ request, cookies }) => {
        const data = await request.formData()
        const username = data.get('username')?.toString().trim()
        const password = data.get('password')?.toString().trim()

        if (!username || username == "") return fail(400, { usernameError: { username, error: "Pole nie może być puste" } })

        if (!password || password == "") return fail(400, { passwordError: { username, error: "Pole nie może być puste" } })

        const nameInUse = await db.user.findUnique({
            where: {
                username: String(username)
            }
        })

        if (nameInUse) return fail(400, { usernameError: { username, error: "Nazwa uzytkownika jest zajeta" } })

        if (String(password).length < 8) return fail(400, { passwordError: { username, error: "Haslo musi miec min 8 znakow" } })

        const hashPassword = await bcrypt.hash(String(password), 12);

        const user = await db.user.create({
            data: {
                username: String(username),
                password_hash: hashPassword
            }
        })

        const session_id = crypto.randomUUID()
        const session_hash = createHash("sha256").update(session_id).digest('hex')

        await db.session.create({
            data: {
                userId: String(user.id),
                session_hash: session_hash
            }
        })

        cookies.set("session", session_id, { path: "/", secure: true, maxAge: 60 * 60 * 24 * 30 })

        redirect(300, "/")
    }
};