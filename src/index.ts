import { GQLService } from '@playlyfe/gql'
import * as fs from 'fs'
import * as rpc from 'vscode-ws-jsonrpc'
import * as ws from 'ws'

interface TextDocument {
    uri: string
    text: string
}

interface Position {
    line: number
    character: number
}

interface Location {
    uri: string
    start: Position
    end: Position
}

function listen({ port, onConnection }: { port: number; onConnection: (socket: rpc.IWebSocket) => void }) {
    const wss = new ws.Server({ port })

    console.log('Listening for WebSocket connections on port', port, '...')

    wss.on('connection', ws => {
        console.log('Client connected')

        const socket: rpc.IWebSocket = {
            send: content =>
                ws.send(content, error => {
                    if (error) {
                        throw error
                    }
                }),
            onMessage: cb => ws.on('message', cb),
            onError: cb => ws.on('error', cb),
            onClose: cb => ws.on('close', cb),
            dispose: () => ws.close(),
        }

        if (ws.readyState === ws.OPEN) {
            onConnection(socket)
        } else {
            ws.on('open', () => onConnection(socket))
        }
    })
}

function serveClient(socket: rpc.IWebSocket) {
    const connection = rpc.createMessageConnection(
        new rpc.WebSocketMessageReader(socket),
        new rpc.WebSocketMessageWriter(socket),
        rpc.NullLogger
    )

    function makeGQLService(text: string): Promise<{ path: string; gqlService: GQLService }> {
        return new Promise(resolve => {
            const path = 'schema.gql'
            fs.writeFileSync(path, text)

            const gqlService = new GQLService({
                onInit: () => resolve({ path, gqlService }),
            })
        })
    }

    connection.onRequest(new rpc.RequestType2('hover'), (doc: TextDocument, pos: Position) =>
        makeGQLService(doc.text).then(({ path, gqlService }) =>
            gqlService.getInfo({
                sourceText: doc.text,
                sourcePath: path,
                position: {
                    line: pos.line + 1,
                    column: pos.character + 1,
                },
            })
        )
    )

    connection.onRequest(
        new rpc.RequestType2('definition'),
        (doc: TextDocument, pos: Position): Promise<Location> =>
            makeGQLService(doc.text).then(({ path, gqlService }) => {
                const definition = gqlService.getDef({
                    sourceText: doc.text,
                    sourcePath: path,
                    position: {
                        line: pos.line + 1,
                        column: pos.character + 1,
                    },
                })
                return (
                    definition && {
                        uri: doc.uri,
                        start: {
                            line: definition.start.line - 1,
                            character: definition.start.column - 1,
                        },
                        end: { line: definition.end.line - 1, character: definition.end.column - 1 },
                    }
                )
            })
    )

    connection.listen()
}

function main() {
    listen({
        port: 1234,
        onConnection: serveClient,
    })
}

main()
