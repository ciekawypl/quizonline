import db from "$lib/server/db"
import { error, redirect, } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals, params }) => {
    const quiz = await db.quiz.findUnique({
        where: { id: params.quiz }
    })

    if (quiz?.userId != locals.user?.userId) {
        error(403, "nie da ciebie")
    }
}

export const actions: Actions = {
    newQuestion: async ({ params, request }) => {
        const data = await request.formData()
        const content = data.get('content')

        const question = await db.question.create({
            data: {
                content: String(content),
                quizId: params.quiz
            }
        })

        redirect(303, "/me/quizzes/" + question.quizId + "/" + question.id)
    },

    editQuiz: async ({ request, params }) => {
        const data = await request.formData()
        const newTitle = data.get('title')
        const newDescription = data.get('description')

        await db.quiz.update({
            where: { id: params.quiz },
            data: {
                title: String(newTitle),
                description: String(newDescription)
            }
        })
    },

    deleteQuiz: async ({ params }) => {
        await db.quiz.delete({
            where: {id: String(params.quiz)}
        })

        redirect(302, "/me/quizzes")
    }
};