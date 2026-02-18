import db from "$lib/server/db";
import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types"
import { isNumericLiteral } from "typescript";

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

    return { quiz }
}

export const actions: Actions = {
    startQuiz: async ({ request, params, locals }) => {
        // const data = await request.formData()
        // const newTitle = data.get('title')?.toString().trim()
        // const newDescription = data.get('description')?.toString().trim()

        // if (!newTitle || newTitle == "")
        //     return fail(400, { newTitleError: { newTitle, error: "Pole jest wymagane" } })

        // if (newTitle.toString().length > 64)
        //     return fail(400, { newTitleError: { newTitle, error: "Tytuł jest zbyt długi" } })

        // if (newDescription!.toString().length > 256)
        //     return fail(400, { newDescriptionError: { newDescription, error: "Opis jest zbyt długi" } })

        // await db.quiz.update({
        //     where: { id: params.quiz },
        //     data: {
        //         title: String(newTitle),
        //         description: String(newDescription)
        //     }
        // })

        // return { success: true }

        const data = await request.formData()
        let title = data.get('title')?.toString().trim()
        const isLoginRequired = data.get('isLoginRequired')
        const quizStyle = data.get('quizStyle')
        const time = Number(data.get('time'))

        const quiz = await db.quiz.findUnique({
            where: { id: params.quiz }
        })

        if (!quiz) {
            error(404, 'Zasób nie istnieje');
        }

        if (quiz?.userId != locals.user?.userId) {
            error(403, 'Brak uprawnień do zasobu');
        }

        if (!title || title == "")
            title = quiz.title

        if (quizStyle != "userBased" && quizStyle != "hostBased" && quizStyle != "timeBased")
            return fail(400, { quizStyleError: { quizStyle, error: "Prosze wybrac poprawną opcje" } })

        if (quizStyle == "timeBased") {
            if (!Number.isInteger(time) || time < 1 || time > 1800) {
                console.log("hit")
                return fail(400, { timeError: { time, error: "Nie poprawny czas" } })
            }
        }

        redirect(302, "/me/play/" + quiz.id)
    }
};