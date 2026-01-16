import db from "$lib/server/db"
import { error } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ locals, params }) => {
    const quiz = await db.quiz.findUnique({
        where: { id: params.quiz }
    })

    if (quiz?.userId != locals.user?.userId) {
        error(403, "nie da ciebie")
    }

    const questions = await db.question.findMany({
        where: {quizId: quiz?.id}
    })

    return { questions, quiz, locals }
}