import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "../../$types.js";
import db from "$lib/server/db.js";

export const load: PageServerLoad = async ({ locals }) => {
    const quizzes = await db.quiz.findMany({
        where: {userId: String(locals.user?.userId)},
    })

    return locals
}

export const actions: Actions = {
    newQuiz: async ({ request, locals }) => {
        const data = await request.formData()
        const quizName = data.get('quizName')

        if (!quizName || quizName == "") {
            return fail(400, { error: "Nie poprawna nazwa quizu!" })
        }

        const quiz = await db.quiz.create({
            data: {
                title: String(quizName),
                userId: String(locals.user?.userId)
            }
        })

        redirect(300, "/me/quizzes/" + quiz.id)
    }
};