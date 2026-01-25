import db from "$lib/server/db"
import { error, fail, redirect, } from "@sveltejs/kit"
import type { Actions, PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals, params }) => {
    const quiz = await db.quiz.findUnique({
        where: { id: params.quiz }
    })

    if (!quiz) {
        error(404, 'Zasób nie istnieje');
    }

    if (quiz?.userId != locals.user?.userId) {
        error(403, 'Brak uprawnień do zasobu');
    }
}

export const actions: Actions = {
    newQuestion: async ({ params, request }) => {
        const data = await request.formData()
        const content = data.get('content')?.toString().trim()

        if (!content || content == "")
            return fail(400, { contentError: { content, error: "Pole jest wymagane" } })

        if (content.toString().length > 256)
            return fail(400, { contentError: { content, error: "Treść jest zbyt długa" } })

        const question = await db.question.create({
            data: {
                content: String(content),
                quizId: params.quiz,
            }
        })

        redirect(303, "/me/quizzes/" + question.quizId + "/" + question.id)
    },

    editQuiz: async ({ request, params }) => {
        const data = await request.formData()
        const newTitle = data.get('title')?.toString().trim()
        const newDescription = data.get('description')?.toString().trim()

        if (!newTitle || newTitle == "")
            return fail(400, { newTitleError: { newTitle, error: "Pole jest wymagane" } })

        if (newTitle.toString().length > 64)
            return fail(400, { newTitleError: { newTitle, error: "Tytuł jest zbyt długi" } })

        if (newDescription!.toString().length > 256)
            return fail(400, { newDescriptionError: { newDescription, error: "Opis jest zbyt długi" } })

        await db.quiz.update({
            where: { id: params.quiz },
            data: {
                title: String(newTitle),
                description: String(newDescription)
            }
        })

        return { success: true }
    },

    deleteQuiz: async ({ params }) => {
        await db.answer.deleteMany({
            where: { question: { quiz: { id: params.quiz } } }
        })

        await db.question.deleteMany({
            where: { quiz: { id: params.quiz } }
        })

        await db.quiz.delete({
            where: { id: params.quiz }
        })

        redirect(302, "/me/quizzes")
    }
};