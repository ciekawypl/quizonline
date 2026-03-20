import { createHash, randomInt } from "crypto";
import { getWebSocketManager, webSocketServer, type WSConnection, type WSMessage } from "sveltekit-ws";
import db from "./db";

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
        sendError(connection, "Nie jestes zalogowany");
        return false
    }

    const session_hash = createHash('sha256').update(sessionId).digest('hex')
    const session = await db.session.findUnique({
        where: { session_hash: session_hash }
    })
    if (!session) {
        sendError(connection, "Nie jestes zalogowany - nie ma cie w bazie")
        return false
    }

    const quiz = await db.quiz.findUnique({
        where: { id: quizId }
    })
    if (!quiz) {
        sendError(connection, "Nie ma takiego quizu")
        return false
    }

    if (quiz.userId !== session.userId) {
        sendError(connection, "Brak uprawnien do zasobu")
        return false
    }

    return true
}

function send(connectionId: string, serverMessage: ServerMessage) {
    const wsMessage = serverMessage as unknown as WSMessage
    getWebSocketManager().send(connectionId, wsMessage)
}

function updateRoom(roomId: string, onlyToHost = false) {
    const room = rooms.get(roomId)
    if (!room) return

    send(room.hostId, {
        type: "roomState",
        room: room
    })

    if (onlyToHost) return;

    room.players.forEach((player) => {
        send(player.id, {
            type: "roomState",
            room: room
        })
    })
}

async function createRoom(connection: WSConnection, quizId: string) {
    if (!await isHostSecure(connection, quizId)) return

    allConnections.add(connection.id)

    const quizLite: QuizLite = await db.quiz.findUnique({
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

    updateRoom(roomId)
}

async function closeRoom(connection: WSConnection, roomId: string) {
    const room = rooms.get(roomId)
    if (!room) return

    if (!await isHostSecure(connection, room.quiz!.id)) return

    allConnections.delete(connection.id)

    room.status = "closed"

    updateRoom(roomId)

    rooms.delete(roomId)
}

function checkForRoom(connection: WSConnection, roomId: string) {
    const room = rooms.get(roomId)

    if (!room) sendError(connection, "Nie znaleziono pokoju")
}

function joinRoom(connection: WSConnection, roomId: string, nickname: string) {
    const room = rooms.get(roomId)

    if (!room) {
        sendError(connection, "Nie znaleziono pokoju")
        return
    }

    if (room.status == "closed") {
        sendError(connection, "Quiz już się zakończył")
    }

    room.players.push({
        id: connection.id,
        nickname: nickname,
        status: "waiting",
        progress_count: 0
    })
    allConnections.add(connection.id)

    updateRoom(roomId)
}

function leaveRoom(connection: WSConnection, roomId: string) {
    const room = rooms.get(roomId)
    if (!room) {
        sendError(connection, "Nie znaleziono pokoju")
        return
    }

    fastRemove(room.players, room.players.findIndex(player => player.id === connection.id))
    allConnections.delete(connection.id)

    updateRoom(roomId)
}

function progressUpdate(connection: WSConnection, roomId: string) {
    const room = rooms.get(roomId)
    if (!room) return

    const player = room.players.find(player => player.id === connection.id)

    if (!player) return sendError(connection, "Gracz nie nalezy do pokoju")

    player.progress_count++
    updateRoom(roomId, true)
}

function statusUpdate(connection: WSConnection, roomId: string, status: PlayerStatus) {
    const room = rooms.get(roomId)
    if (!room) return

    const player = room.players.find(player => player.id === connection.id)

    if (!player) return sendError(connection, "Gracz nie nalezy do pokoju")

    player.status = status

    updateRoom(roomId, true)
}

async function startRoom(connection: WSConnection, roomId: string) {
    const room = rooms.get(roomId)
    if (!room) return

    if (!await isHostSecure(connection, room.quiz!.id)) return

    if (room.status != "waiting") {
        sendError(connection, "Nie mozna teraz rozpoczac quizu")
        return
    }

    room.status = "started"

    updateRoom(roomId)
}

async function stopRoom(connection: WSConnection, roomId: string) {
    const room = rooms.get(roomId)
    if (!room) return

    if (!await isHostSecure(connection, room.quiz!.id)) return

    if (room.status == "closed") {
        sendError(connection, "Nie mozna teraz zatrzymać quizu")
        return
    }

    room.status = "closed"

    updateRoom(roomId)
}

function sendError(connection: WSConnection, error: string) {
    const wsMessage = {
        type: "error",
        error: error
    } as unknown as WSMessage
    getWebSocketManager().send(connection.id, wsMessage)
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
                    joinRoom(connection, clientMessage.roomId, clientMessage.nickname)
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
                case "progressUpdate": {
                    progressUpdate(connection, clientMessage.roomId)
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