import db from "$lib/server/db"
import { error } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ locals, params }) => {
    const quiz = await db.quiz.findUnique({
        where: { id: params.quiz },
        include: { questions: {} }
    })

    if (!quiz) {
        error(404, 'Zasób nie istnieje');
    }

    if (quiz?.userId != locals.user?.userId) {
        error(403, 'Brak uprawnień do zasobu');
    }

    return { quiz }
}