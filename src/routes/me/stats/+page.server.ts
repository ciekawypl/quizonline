import db from "$lib/server/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    const hosted = await db.game.findMany({
        where: {
            quiz: {
                userId: locals.user?.userId
            }
        },
        select: {
            id: true,
            endedAt: true,
            quiz: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    })

    const played = await db.player.findMany({
        where: {
            userId: locals.user?.userId,
        },
        select: {
            id: true,
            game: {
                select: {
                    endedAt: true,
                    quiz: {
                        select: {
                            title: true
                        }
                    }
                }
            }
        }
    })

    return { hosted, played }
};