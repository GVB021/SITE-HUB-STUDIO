import test from "node:test";
import assert from "node:assert/strict";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";

test("WebSocket - Sincronização e Comunicação Multi-usuário em uma Room", async () => {
  return new Promise<void>((resolve, reject) => {
    const server = createServer();
    const wss = new WebSocketServer({ server });
    
    let connectedClients = 0;
    const rooms = new Map<string, Set<WebSocket>>();

    wss.on("connection", (ws, req) => {
      connectedClients++;
      const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
      const sessionId = url.searchParams.get("sessionId");

      if (!sessionId) {
        ws.close(1008, "sessionId required");
        return;
      }

      if (!rooms.has(sessionId)) {
        rooms.set(sessionId, new Set());
      }
      rooms.get(sessionId)!.add(ws);

      ws.on("message", (message) => {
        const data = JSON.parse(message.toString());
        const room = rooms.get(sessionId);
        if (room) {
          room.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
        }
      });

      ws.on("close", () => {
        const room = rooms.get(sessionId);
        if (room) {
          room.delete(ws);
          if (room.size === 0) rooms.delete(sessionId);
        }
      });
    });

    server.listen(0, () => {
      const port = (server.address() as any).port;
      
      // Simulando o Diretor conectando
      const wsDirector = new WebSocket(`ws://localhost:${port}/?sessionId=test-room-1`);
      
      // Simulando o Dublador conectando na mesma rede/sala
      const wsVoiceActor = new WebSocket(`ws://localhost:${port}/?sessionId=test-room-1`);

      let directorConnected = false;
      let actorConnected = false;

      const checkConnections = () => {
        if (directorConnected && actorConnected) {
          // Quando ambos estiverem conectados, o diretor envia o comando de "play"
          wsDirector.send(JSON.stringify({ type: "video:play", currentTime: 15.5 }));
        }
      };

      wsDirector.on("open", () => {
        directorConnected = true;
        checkConnections();
      });

      wsVoiceActor.on("open", () => {
        actorConnected = true;
        checkConnections();
      });

      // O dublador recebe a mensagem do diretor
      wsVoiceActor.on("message", (msg) => {
        const data = JSON.parse(msg.toString());
        try {
          // Asseguramos que o dublador recebeu EXATAMENTE a mesma mensagem que o diretor enviou
          assert.equal(data.type, "video:play");
          assert.equal(data.currentTime, 15.5);
          
          // Teste bem sucedido. Fechar conexões.
          wsDirector.close();
          wsVoiceActor.close();
          server.close();
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  });
});
