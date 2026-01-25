import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types.js";
import db from "$lib/server/db.js";

export const load: PageServerLoad = async ({ locals }) => {
    const quizzes = await db.quiz.findMany({
        where: { userId: String(locals.user?.userId) },
    })

    return { quizzes }
}

export const actions: Actions = {
    newQuiz: async ({ request, locals }) => {
        const data = await request.formData()
        const quizName = data.get('quizName')?.toString().trim()

        if (!quizName || quizName == "")
            return fail(400, { errorBlank: "Pole jest wymagane!" })

        if (quizName.toString().length > 64)
            return fail(400, { quizName, errorTooLong: "Tytuł jest zbyt długi!" })

        const quiz = await db.quiz.create({
            data: {
                title: String(quizName),
                userId: String(locals.user?.userId)
            }
        })

        redirect(300, "/me/quizzes/" + quiz.id)
    }
};