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

    room.players.forEach((playerId) => {
        send(playerId, {
            type: "roomState",
            room: room
        })
    })
}

async function createRoom(connection: WSConnection, quizId: string) {
    if (!await isHostSecure(connection, quizId)) return

    allConnections.add(connection.id)

    const roomId = randomInt(100000, 999999).toString()
    const room: Room = {
        id: roomId,
        quizId: quizId,
        hostId: connection.id,
        players: [],
        status: "open"
    }

    rooms.set(roomId, room)

    updateRoom(roomId)
}

async function closeRoom(connection: WSConnection, roomId: string) {
    const room = rooms.get(roomId)
    if (!room) return

    if (!await isHostSecure(connection, room.quizId)) return

    allConnections.delete(connection.id)

    room.status = "closed"

    updateRoom(roomId)

    rooms.delete(roomId)
}

function joinRoom(connection: WSConnection, roomId: string) {
    const room = rooms.get(roomId)

    if (!room) {
        sendError(connection, "Nie znaleziono pokoju")
        return
    }

    room.players.push(connection.id)
    allConnections.add(connection.id)

    updateRoom(roomId)
}

function leaveRoom(connection: WSConnection, roomId: string) {
    const room = rooms.get(roomId)
    if (!room) {
        sendError(connection, "Nie znaleziono pokoju")
        return
    }

    fastRemove(room.players, room.players.indexOf(connection.id))
    allConnections.delete(connection.id)

    updateRoom(roomId)
}

function sendError(connection: WSConnection, data?: any) {
    console.log(data);
    getWebSocketManager().send(connection.id, {
        type: "error",
        data: data
    })
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
                case "joinRoom": {
                    joinRoom(connection, clientMessage.roomId)
                    break
                }
                case "leaveRoom": {
                    leaveRoom(connection, clientMessage.roomId)
                    break
                }
            }
        },

        onDisconnect: (connection) => {
            if (allConnections.delete(connection.id)) {
                rooms.forEach(room => {
                    if (room?.hostId === connection.id) closeRoom(connection, room.id)

                    room?.players.forEach(playerId => {
                        if (playerId === connection.id) leaveRoom(connection, room.id)
                    });
                });
            }
        }
    },
})

export default ws