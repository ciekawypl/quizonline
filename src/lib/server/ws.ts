import { createHash, randomInt } from "crypto";
import { getWebSocketManager, webSocketServer, type WSConnection, type WSMessage } from "sveltekit-ws";
import db from "./db";
import { SvelteMap } from "svelte/reactivity";

const rooms = new Map<string, Room>()
const allConnections = new Set<string>()

function fastRemove<T>(arr: T[], index: number): void {
    const lastIndex = arr.length - 1;
    if (index < lastIndex) {
        arr[index] = arr[lastIndex];
    }
    arr.pop();
}

async function isHostSecure(connection: WSConnection, quizId: string) {
    const sessionId = connection.metadata?.headers?.cookie.split("; ").find((c: string) => c.startsWith("session=")).split('=')[1]
    if (!sessionId) {
        sendError(connection.id, "Nie jestes zalogowany");
        return false
    }

    const session_hash = createHash('sha256').update(sessionId).digest('hex')
    const session = await db.session.findUnique({
        where: { session_hash: session_hash }
    })
    if (!session) {
        sendError(connection.id, "Nie jestes zalogowany - nie ma cie w bazie")
        return false
    }

    const quiz = await db.quiz.findUnique({
        where: { id: quizId }
    })
    if (!quiz) {
        sendError(connection.id, "Nie ma takiego quizu")
        return false
    }

    if (quiz.userId !== session.userId) {
        sendError(connection.id, "Brak uprawnien do zasobu")
        return false
    }

    return true
}

function send(connectionId: string, serverMessage: ServerMessage) {
    const wsMessage = serverMessage as unknown as WSMessage
    getWebSocketManager().send(connectionId, wsMessage)
}

function sendToEveryoneInRoom(roomId: string, serverMessage: ServerMessage) {
    const room = rooms.get(roomId)
    if (!room) return

    send(room.hostId, serverMessage)

    room.players.forEach((player) => {
        send(player.id, serverMessage)
    })
}

async function createRoom(connection: WSConnection, quizId: string) {
    if (!await isHostSecure(connection, quizId)) return

    allConnections.add(connection.id)

    const quizLite: QuizLite | null = await db.quiz.findUnique({
        where: { id: quizId },
        select: {
            id: true,
            title: true,
            questions: {
                select: {
                    id: true,
                    content: true,
                    answers: {
                        select: {
                            id: true,
                            content: true
                        }
                    }
                }
            }
        }
    })

    const roomId = randomInt(100000, 999999).toString()
    const room: Room = {
        id: roomId,
        quiz: quizLite,
        hostId: connection.id,
        players: [],
        status: "waiting"
    }

    rooms.set(roomId, room)

    send(connection.id, {
        type: "roomCreated",
        roomId: roomId,
        quizLength: quizLite!.questions.length
    })
}

async function closeRoom(connection: WSConnection, roomId: string) {
    const room = rooms.get(roomId)
    if (!room) return

    if (!await isHostSecure(connection, room.quiz!.id)) return

    allConnections.delete(connection.id)

    room.status = "closed"

    sendToEveryoneInRoom(roomId, {
        type: "roomClosed"
    })

    rooms.delete(roomId)
}

function checkForRoom(connection: WSConnection, roomId: string) {
    const room = rooms.get(roomId)

    if (!room) sendError(connection.id, "Nie znaleziono pokoju")
}

function joinRoom(connection: WSConnection, roomId: string, nickname: string, userId: string | null) {
    const room = rooms.get(roomId)

    if (!room) {
        sendError(connection.id, "Nie znaleziono pokoju")
        return
    }

    if (room.status == "closed") {
        sendError(connection.id, "Quiz już się zakończył")
    }

    const player: Player = {
        id: connection.id,
        userId: userId,
        nickname: nickname,
        status: "waiting",
        solutions: new SvelteMap<string, string>()
    }

    room.players.push(player)
    allConnections.add(connection.id)

    send(connection.id, {
        type: "joinedRoom",
        roomStatus: room.status,
        quiz: room.quiz
    })

    send(room.hostId, {
        type: "playerJoined",
        playerId: player.id,
        playerStatus: player.status,
        nickname: player.nickname
    })
}

function leaveRoom(connection: WSConnection, roomId: string) {
    const room = rooms.get(roomId)
    if (!room) {
        sendError(connection.id, "Nie znaleziono pokoju")
        return
    }

    const player = room.players.find(player => player.id === connection.id)

    if (!player) return sendError(connection.id, "Gracz nie nalezy do pokoju")

    if (player.status != "ended") {
        player.status = "left"
    }

    send(room.hostId, {
        type: "playerStatusUpdate",
        playerId: player.id,
        status: player.status
    })
}

function progressUpdate(connection: WSConnection, roomId: string, questionId: string, answerId: string) {
    const room = rooms.get(roomId)
    if (!room) return

    const player = room.players.find(player => player.id === connection.id)

    if (!player) return sendError(connection.id, "Gracz nie nalezy do pokoju")

    player.solutions.set(questionId, answerId)
    send(room.hostId, {
        type: "playerProgressUpdate",
        playerId: connection.id,
        questionId: questionId,
        answerId: answerId
    })
}

async function statusUpdate(connection: WSConnection, roomId: string, status: PlayerStatus) {
    const room = rooms.get(roomId)
    if (!room) return

    const player = room.players.find(player => player.id === connection.id)

    if (!player) return sendError(connection.id, "Gracz nie nalezy do pokoju")

    player.status = status

    send(room.hostId, {
        type: "playerStatusUpdate",
        playerId: player.id,
        status: status
    })

    if (status == "ended") {
        sendScore(player)
    }
}

async function startRoom(connection: WSConnection, roomId: string) {
    const room = rooms.get(roomId)
    if (!room) return

    if (!await isHostSecure(connection, room.quiz!.id)) return

    if (room.status != "waiting") {
        sendError(connection.id, "Nie mozna teraz rozpoczac quizu")
        return
    }

    room.status = "started"

    sendToEveryoneInRoom(roomId, {
        type: "roomStarted"
    })
}

async function stopRoom(connection: WSConnection, roomId: string) {
    const room = rooms.get(roomId)
    if (!room) return

    if (!await isHostSecure(connection, room.quiz!.id)) return

    if (room.status == "closed") {
        sendError(connection.id, "Nie mozna teraz zatrzymać quizu")
        return
    }

    room.status = "closed"

    room.players.forEach(player => {
        if (player.status == "started") {
            player.status = "ended"
            sendScore(player)
            send(room.hostId, {
                type: "playerStatusUpdate",
                playerId: player.id,
                status: player.status
            })
        }
    })

    let gameId

    if (room.players.length != 0) {
        await db.$transaction(async (tx) => {
            const game = await tx.game.create({
                data: {
                    quizId: room.quiz!.id,
                    players: {
                        create: room.players.map(p => ({
                            name: p.nickname,
                            userId: p.userId
                        }))
                    }
                },
                include: { players: true }
            });

            gameId = String(game.id)

            const solutionsData = game.players.flatMap((dbPlayer, index) => {
                const runtimePlayer = room.players[index];

                return Array.from(runtimePlayer.solutions.entries()).map(
                    ([questionId, answerId]) => ({
                        playerId: dbPlayer.id,
                        questionId: Number(questionId),
                        answerId: Number(answerId)
                    })
                );
            });

            await tx.solution.createMany({
                data: solutionsData
            });
        });
    }

    sendToEveryoneInRoom(roomId, {
        type: "roomStopped",
        gameId: gameId
    })
}

async function sendScore(player: Player) {
    const submitted: number[] = []
    player.solutions.forEach(solution => {
        submitted.push(Number(solution))
    })

    const answers = await db.answer.findMany({
        where: {
            id: {
                in: submitted
            }
        }
    })

    let score = 0
    answers.forEach(answer => {
        if (answer.isCorrect) {
            score++
        }
    })

    send(player.id, {
        type: "playerScore",
        score: score
    })
}

async function kickPlayer(connection: WSConnection, roomId: string, playerId: string) {
    const room = rooms.get(roomId)
    if (!room) return

    if (!await isHostSecure(connection, room.quiz!.id)) return

    const playerIndex = room.players.findIndex(player => player.id == playerId)
    const player = room.players[playerIndex]

    if (!player) return sendError(connection.id, "Gracz nie nalezy do pokoju")

    fastRemove(room.players, playerIndex)

    sendError(player.id, "Zostales wyrzucony z pokoju")
}

function sendError(connectionId: string, error: string) {
    const wsMessage = {
        type: "error",
        error_msg: error
    } as unknown as WSMessage
    getWebSocketManager().send(connectionId, wsMessage)
}

const ws = webSocketServer({
    path: "/ws",
    handlers: {
        onMessage: async (connection, message) => {
            const clientMessage = message as unknown as ClientMessage

            switch (clientMessage.type) {
                case "createRoom": {
                    createRoom(connection, clientMessage.quizId)
                    break
                }
                case "closeRoom": {
                    closeRoom(connection, clientMessage.roomId)
                    break
                }
                case "checkForRoom": {
                    checkForRoom(connection, clientMessage.roomId)
                    break
                }
                case "joinRoom": {
                    joinRoom(connection, clientMessage.roomId, clientMessage.nickname, clientMessage.userId)
                    break
                }
                case "leaveRoom": {
                    leaveRoom(connection, clientMessage.roomId)
                    break
                }
                case "startRoom": {
                    startRoom(connection, clientMessage.roomId)
                    break
                }
                case "stopRoom": {
                    stopRoom(connection, clientMessage.roomId)
                    break
                }
                case "kickPlayer": {
                    kickPlayer(connection, clientMessage.roomId, clientMessage.playerId)
                    break
                }
                case "progressUpdate": {
                    progressUpdate(connection, clientMessage.roomId, clientMessage.questionId, clientMessage.answerId)
                    break
                }
                case "statusUpdate": {
                    statusUpdate(connection, clientMessage.roomId, clientMessage.status)
                    break
                }
            }
        },

        onDisconnect: (connection) => {
            if (allConnections.delete(connection.id)) {
                rooms.forEach(room => {
                    if (room?.hostId === connection.id) closeRoom(connection, room.id)

                    room?.players.forEach(player => {
                        if (player.id === connection.id) leaveRoom(connection, room.id)
                    });
                });
            }
        }
    },
})

export default ws