import db from "$lib/server/db";
import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
    const quiz = await db.quiz.findUnique({
        where: { id: params.quiz },
        include: { questions: { where: { id: Number(params.question) }, include: { answers: {} } } }
    })

    if (quiz?.userId != locals.user?.userId)
        error(403, "Brak dostępu do zasobu")

    const question = quiz?.questions[0]

    if (!question)
        error(404, "Zasób nie istnieje")
};

export const actions: Actions = {
    editQuestion: async ({ request, params }) => {
        const data = await request.formData()
        const newContent = data.get('content')?.toString().trim()

        if (!newContent || newContent == "")
            return fail(400, { contentError: { newContent, error: "Pole jest wymagane" } })

        if (newContent.toString().length > 256)
            return fail(400, { contentError: { newContent, error: "Treść jest zbyt długa" } })

        await db.question.update({
            where: { id: Number(params.question) },
            data: {
                content: String(newContent)
            }
        })

        return { success: true }
    },

    deleteQuestion: async ({ params }) => {
        await db.answer.deleteMany({
            where: { questionId: Number(params.question) }
        })

        await db.question.delete({
            where: { id: Number(params.question) }
        })

        redirect(302, "/me/quizzes/" + params.quiz)
    },

    newAnswer: async ({ request, params }) => {
        const data = await request.formData()
        const newContent = data.get('content')?.toString().trim()
        const newIsCorrect = data.get('isCorrect')

        if (!newContent || newContent == "")
            return fail(400, { contentError: { newContent, error: "Pole jest wymagane" } })

        if (newContent.toString().length > 256)
            return fail(400, { contentError: { newContent, error: "Treść jest zbyt długa" } })

        const answer = await db.answer.create({
            data: {
                content: String(newContent),
                isCorrect: Boolean(newIsCorrect),
                questionId: Number(params.question),
            }
        })

        redirect(302, "/me/quizzes/" + params.quiz + "/" + params.question + "/" + answer.id)
    }
};