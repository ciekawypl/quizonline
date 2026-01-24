import db from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const answer = await db.answer.findUnique({
        where: { id: Number(params.answer) }
    })

    return { answer }
};

export const actions: Actions = {
    editAnswer: async ({ request, params }) => {
        const data = await request.formData()
        const newContent = data.get('content')
        const newIsCorrect = data.get('isCorrect')

        await db.answer.update({
            where: { id: Number(params.answer) },
            data: {
                content: String(newContent),
                isCorrect: Boolean(newIsCorrect)
            }
        })
    },

    deleteAnswer: async ({ params }) => {
        await db.answer.delete({
            where: { id: Number(params.answer) }
        })

        redirect(302, "/me/quizzes/" + params.quiz + "/" + params.question)
    }
};