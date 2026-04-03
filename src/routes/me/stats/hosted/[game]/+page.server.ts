import db from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    const game = await db.game.findUnique({
        where: {
            id: Number(params.game)
        },
        select: {
            endedAt: true,
            quiz: {
                select: {
                    title: true,
                    userId: true,
                    questions: true
                }
            },
            players: {
                select: {
                    name: true,
                    solutions: {
                        select: {
                            answer: {
                                select: {
                                    isCorrect: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!game) {
        error(404, 'Zasób nie istnieje');
    }

    if (game.quiz.userId != locals.user?.userId) {
        error(403, 'Brak uprawnień do zasobu');
    }

    const sorted_data: { title: string, quiz_length: number, players: { name: string, points: number, score: number }[] } = {
        title: game.quiz.title,
        quiz_length: game.quiz.questions.length,
        players: []
    }

    game.players.forEach(p => {
        const points =  p.solutions.filter(s => s.answer.isCorrect).length
        sorted_data.players.push({
            name: p.name,
            points: points,
            score: (points * 100) / sorted_data.quiz_length
        })
    })

    sorted_data.players.sort((a, b) => b.score - a.score)

    return { game: sorted_data }
};