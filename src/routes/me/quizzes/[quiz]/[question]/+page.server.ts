import db from "$lib/server/db";
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
    const question = await db.question.findUnique({
        where: { id: Number(params.question) }
    })

    const answers = await db.answer.findMany({
        where: { questionId: question?.id }
    })

    return { question, answers }
};

export const actions: Actions = {
    editQuestion: async ({ request, params }) => {
        const data = await request.formData()
        const newContent = data.get('content')

        await db.question.update({
            where: { id: Number(params.question) },
            data: {
                content: String(newContent)
            }
        })
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
        const newContent = data.get('content')

        const question = await db.question.findUnique({
            where: { id: Number(params.question) }
        })

        await db.answer.create({
            data: {
                content: String(newContent),
                questionId: question!.id
            }
        })
    }
};