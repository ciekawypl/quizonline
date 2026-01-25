import db from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    const quiz = await db.quiz.findUnique({
        where: { id: params.quiz },
        include: {
            questions: {
                where: { id: Number(params.question) },
                include: {
                    answers: {
                        where: { id: Number(params.answer) }
                    }
                }
            }
        }
    })

    if (quiz?.userId != locals.user?.userId) error(403, "Brak dostępu do zasobu")

    const answer = quiz?.questions[0].answers[0]

    if (!answer) error(404, "Zasob nie istnieje")

    return { answer }
};

export const actions: Actions = {
    editAnswer: async ({ request, params }) => {
        const data = await request.formData()
        const newContent = data.get('content')?.toString().trim()
        const newIsCorrect = data.get('isCorrect')

        if (!newContent || newContent == "") return fail(400, { contentError: { newContent, error: "Pole jest wymagane" } })

        if (newContent.toString().length > 256) return fail(400, { contentError: { newContent, error: "Treść jest zbyt długa" } })

        await db.answer.update({
            where: { id: Number(params.answer) },
            data: {
                content: String(newContent),
                isCorrect: Boolean(newIsCorrect)
            }
        })

        return { success: true }
    },

    deleteAnswer: async ({ params }) => {
        await db.answer.delete({
            where: { id: Number(params.answer) }
        })

        redirect(302, "/me/quizzes/" + params.quiz + "/" + params.question)
    }
};