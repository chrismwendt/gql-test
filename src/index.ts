import { GQLService } from "@playlyfe/gql";
import * as fs from "fs";
import * as rpc from "vscode-ws-jsonrpc";

import * as ws from "ws";

// const wss = new ws.Server({
//   port: 1234
// });

// console.log("listening");
// wss.on("connection", ws => {
//   // ws.on("close", console.log);
//   // ws.on("error", console.log);
//   ws.on("message", console.log);
//   // ws.on("open", console.log);
//   console.log("got conn");
//   const socket: rpc.IWebSocket = {
//     send: content =>
//       ws.send(content, error => {
//         if (error) {
//           throw error;
//         }
//       }),
//     onMessage: cb => {
//       console.log("msg", cb);
//       return ws.on("message", cb);
//     },
//     onError: cb => ws.on("error", cb),
//     onClose: cb => ws.on("close", cb),
//     dispose: () => ws.close()
//   };
//   // launch the server when the web socket is opened
//   if (ws.readyState === ws.OPEN) {
//     launch(socket);
//   } else {
//     ws.on("open", () => launch(socket));
//   }
// });

// function launch(socket: rpc.IWebSocket) {
//   console.log("launch");

//   const reader = new rpc.WebSocketMessageReader(socket);
//   const writer = new rpc.WebSocketMessageWriter(socket);
//   const logger = new rpc.ConsoleLogger();
//   const connection = rpc.createMessageConnection(reader, writer, logger);
//   connection.onRequest<{ contents: { value: string } }, void>(
//     "hov",
//     (
//       doc: { uri: string; languageId: string; text: string },
//       pos: { line: number; character: number }
//     ) =>
//       new Promise(resolve => {
//         fs.writeFileSync("schema.gql", doc.text);

//         const s = new GQLService({
//           onInit: () => {
//             const d = s.getDef({
//               sourceText: fs.readFileSync("schema.gql").toString(),
//               sourcePath: "schema.gql",
//               position: {
//                 line: pos.line + 1,
//                 column: pos.character + 1
//               }
//             });
//             console.log("info", d);
//             resolve(d);
//           }
//         });
//       })
//   );

//   connection.listen();
//   connection.sendNotification("sup");
// }

const s = new GQLService({
  onInit: () => {
    const d = s.getDef({
      sourceText: fs.readFileSync("schema.gql").toString(),
      sourcePath: "schema.gql",
      position: {
        line: 6,
        column: 10
      }
    });
    console.log("huh", d);
  }
});
