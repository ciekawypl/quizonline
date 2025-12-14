import bcrypt from 'bcrypt'
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

import db from "$lib/db"

export const actions: Actions = {
    login: async ({ request }) => {
        const data = await request.formData()
        const username = data.get('username')
        const password = data.get('password')

        if (!username || !password) {
            return fail(400, { error: "Uzupelnij wymagane dane" })
        }

        const user = await db.user.findUnique({
            where: {
                username: String(username),
            }
        })

        if (!user) {
            return fail(400, { error: "Nie poprawny uzytkownik lub haslo" })
        }

        const valid = await bcrypt.compare(String(password)!, user.password_hash)

        if (!valid) {
            return fail(400, { error: "Nie poprawny uzytkownik lub haslo" })
        }

        redirect(300, "/")
    },

    register: async ({ request }) => {
        const data = await request.formData()
        const username = data.get('username')
        const password = data.get('password')

        if (!username || !password) {
            return fail(400, { error: "Uzupelnij wymagane dane" })
        }

        const user = await db.user.findUnique({
            where: {
                username: String(username)
            }
        })

        if (user) {
            return fail(400, { error: "Nazwa uzytkownika jest zajeta" })
        }

        if (String(password).length < 8) {
            return fail(400, { error: "Haslo musi miec min 8 znakow" })
        }

        const hashPassword = await bcrypt.hash(String(password), 12);

        await db.user.create({
            data: {
                username: String(username),
                password_hash: hashPassword
            }
        })
    }
};