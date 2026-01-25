import db from "$lib/server/db";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, params }) => {
    const quiz = await db.quiz.findUnique({
        where: { id: params.quiz },
        include: {
            questions: {
                where: { id: Number(params.question) },
                include: { answers: {} }
            }
        }
    })

    if (quiz?.userId != locals.user?.userId) error(403, "Brak dostępu do zasobu")

    const question = quiz?.questions[0]
    const answers = question?.answers

    if (!question) error(404, "Zasób nie istnieje")

    return { question, answers }
};
