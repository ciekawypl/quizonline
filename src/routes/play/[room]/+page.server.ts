import db from "$lib/server/db";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (locals) {
        const user = await db.user.findUnique({
            where: { id: String(locals.user?.userId) },
            select: { username: true }
        })
        return { username: user?.username }
    }
};

export const actions: Actions = {
    setName: async ({ request }) => {
        const data = await request.formData();
        const nickname = data.get('nickname')?.toString().trim()

        if (!nickname || nickname == "") return fail(400, { error: "Pole jest wymagane!" })

        if (nickname.length > 32) return fail(400, { nickname, error: "Nazwa jest zbyt długa!" })

        return { "validName": nickname }
    }
};