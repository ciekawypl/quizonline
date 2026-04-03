import db from "$lib/server/db";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
    const raw_solutions = await db.solution.findMany({
        where: {
            playerId: Number(params.player)
        },
        select: {
            player: {
                select: {
                    userId: true
                }
            },
            questionId: true,
            answerId: true,
            answer: {
                select: {
                    content: true
                }
            }
        }
    })

    if (raw_solutions.length == 0) {
        error(404, 'Zasób nie istnieje');
    }

    if (raw_solutions[0].player.userId != locals.user?.userId) {
        error(403, 'Brak uprawnień do zasobu');
    }

    const solutions = new Map<number, { id: number, content: string }>()
    raw_solutions.forEach(solution => solutions.set(solution.questionId, { id: solution.answerId, content: solution.answer.content }))

    const raw_questions = await db.player.findUnique({
        where: {
            id: Number(params.player)
        },
        select: {
            game: {
                select: {
                    quiz: {
                        select: {
                            questions: {
                                select: {
                                    id: true,
                                    content: true,
                                    answers: {
                                        where: {
                                            isCorrect: true
                                        },
                                        select: {
                                            id: true,
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    const questions = raw_questions?.game.quiz.questions

    interface Solution {
        quetsion_content: string
        answer_content: string | undefined
        is_correct: boolean
    }

    const data: Solution[] = []

    questions?.forEach(question => {
        let is_correct = false

        question.answers.forEach(answer => {
            if (answer.id == solutions.get(question.id)?.id) is_correct = true
        })

        const solution: Solution = {
            quetsion_content: question.content,
            answer_content: solutions.get(question.id)?.content,
            is_correct: is_correct
        }

        data.push(solution)
    })

    return { solutions: data }
};