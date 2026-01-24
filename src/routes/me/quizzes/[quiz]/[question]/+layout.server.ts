import db from "$lib/server/db";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ params }) => {
    const question = await db.question.findUnique({
        where: { id: Number(params.question) }
    })

    const answers = await db.answer.findMany({
        where: { questionId: question?.id }
    })

    return { question, answers }
};
