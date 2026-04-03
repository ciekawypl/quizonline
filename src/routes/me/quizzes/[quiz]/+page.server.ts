import db from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
    const quiz = await db.quiz.findUnique({
        where: { id: params.quiz },
        include: {
            questions: {
                include: {
                    answers: true
                }
            }
        }
    })

    if (!quiz) {
        error(404, 'Zasób nie istnieje');
    }

    if (quiz?.userId != locals.user?.userId) {
        error(403, 'Brak uprawnień do zasobu');
    }

    return quiz
}

export const actions: Actions = {
    editQuiz: async ({ request, locals }) => {
        const data = await request.formData()
        const quizId = data.get('quizId')?.toString().trim()
        const title = data.get('title')?.toString().trim()
        const description = data.get('description')?.toString().trim()

        if (!quizId || quizId == "") return fail(400, "Nie poprawne zapytanie")
        if (!title || title == "") return fail(400, "Nie poprawne zapytanie")
        if (!description || description == "") return fail(400, "Nie poprawne zapytanie")

        const quiz = await db.quiz.findUnique({
            where: { id: quizId }
        })

        if (!quiz) return fail(404, "Nie znaleziono zasobu")

        if (quiz.userId != locals.user?.userId) return fail(403, "Brak uprawnien do zasobu")

        await db.quiz.update({
            where: { id: quizId },
            data: {
                title: title,
                description: description
            }
        })
    },

    deleteQuiz: async ({ request, locals }) => {
        const data = await request.formData()
        const quizId = data.get('quizId')?.toString().trim()

        if (!quizId || quizId == "") return fail(400, "Nie poprawne zapytanie")

        const quiz = await db.quiz.findUnique({
            where: { id: quizId }
        })

        if (!quiz) return fail(404, "Nie znaleziono zasobu")

        if (quiz.userId != locals.user?.userId) return fail(403, "Brak uprawnien do zasobu")

        await db.answer.deleteMany({
            where: { question: { quiz: { id: quizId } } }
        })

        await db.question.deleteMany({
            where: { quiz: { id: quizId } }
        })

        await db.quiz.delete({
            where: { id: quizId }
        })

        redirect(302, "/me/quizzes")
    },

    newQuestion: async ({ params, locals }) => {
        const quiz = await db.quiz.findUnique({
            where: { id: params.quiz }
        })

        if (!quiz) return fail(404, "Zasób nie istnieje")

        if (quiz?.userId != locals.user?.userId) {
            return fail(403, 'Brak uprawnień do zasobu');
        }

        await db.question.create({
            data: {
                content: "Treść pytania",
                quizId: params.quiz,
            }
        })
    },

    deleteQuestion: async ({ request, locals }) => {
        const data = await request.formData()
        const questionId = data.get('questionId')?.toString().trim()

        if (!questionId || questionId == "") return fail(400, "Nie poprawne zapytanie")

        const question = await db.question.findUnique({
            where: { id: Number(questionId) },
            include: { quiz: true }
        })

        if (!question) return fail(404, "Zasób nie istnieje")

        if (question.quiz.userId != locals.user?.userId) return fail(403, "Brak uprawnień do zasobu")

        await db.answer.deleteMany({
            where: { questionId: Number(questionId) }
        })

        await db.question.delete({
            where: { id: Number(questionId) }
        })
    },

    editQuestion: async ({ request, locals }) => {
        const data = await request.formData()
        const questionId = data.get('questionId')?.toString().trim()
        const newContent = data.get('newContent')?.toString().trim()

        if (!questionId || questionId == "") return fail(400, "Nie poprawne zapytanie")

        if (!newContent || newContent == "") return fail(400, "Pole nie może być puste")

        if (newContent.toString().length > 256)
            return fail(400, { contentError: { content: newContent, error: "Treść jest zbyt długa" } })

        const question = await db.question.findUnique({
            where: { id: Number(questionId) },
            include: { quiz: true }
        })

        if (!question) return fail(404, "Zasób nie istnieje")

        if (question.quiz.userId != locals.user?.userId) return fail(403, "Brak uprawnień do zasobu")

        await db.question.update({
            where: { id: Number(questionId) },
            data: { content: newContent }
        })
    },

    newAnswer: async ({ request, locals }) => {
        const data = await request.formData()
        const questionId = data.get('questionId')?.toString().trim()

        if (!questionId) return fail(400, "Nie poprawne zapytanie")

        const question = await db.question.findUnique({
            where: { id: Number(questionId) },
            include: { quiz: true }
        })

        if (!question) return fail(404, "Zasób nie istnieje")

        if (!question.quiz) return fail(404, "Zasób nie istnieje")

        if (question.quiz.userId != locals.user?.userId) {
            return fail(403, 'Brak uprawnień do zasobu');
        }

        await db.answer.create({
            data: {
                content: "Treść odpowiedzi",
                isCorrect: false,
                questionId: Number(questionId)
            }
        })
    },

    deleteAnswer: async ({ request, locals }) => {
        const data = await request.formData()
        const answerId = data.get('answerId')?.toString().trim()

        if (!answerId || answerId == "")
            return fail(400, "Nie poprawne zapytanie")

        const answer = await db.answer.findUnique({
            where: { id: Number(answerId) },
            include: {
                question: {
                    include: { quiz: true }
                }
            }
        })

        if (!answer) return fail(404, "Zasób nie istnieje")

        if (answer.question.quiz.userId != locals.user?.userId)
            return fail(403, "Brak dostępu do zasobu")

        await db.answer.delete({
            where: { id: Number(answerId) }
        })
    },

    editAnswer: async ({ request, locals }) => {
        const data = await request.formData()
        const answerId = data.get('answerId')?.toString().trim()
        const newContent = data.get('newContent')?.toString().trim()
        const isCorrect = data.get('isCorrect')?.toString().trim()

        if (!answerId || answerId == "") return fail(400, "Nie poprawne zapytanie")

        if (!newContent || newContent == "") return fail(400, "Pole nie może być puste")

        if (newContent.toString().length > 256)
            return fail(400, { contentError: { content: newContent, error: "Treść jest zbyt długa" } })

        const answer = await db.answer.findUnique({
            where: { id: Number(answerId) },
            include: {
                question: {
                    include: { quiz: true }
                }
            }
        })

        if (!answer) return fail(404, "Zasób nie istnieje")

        if (answer.question.quiz.userId != locals.user?.userId) return fail(403, "Brak uprawnień do zasobu")

        await db.answer.updateMany({
            where: {
                questionId: answer.questionId
            },
            data: {
                isCorrect: false
            }
        })

        await db.answer.update({
            where: { id: Number(answerId) },
            data: {
                content: newContent,
                isCorrect: Boolean(isCorrect)
            }
        })
    }
};