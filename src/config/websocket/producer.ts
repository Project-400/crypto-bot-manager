import http from 'http';
import * as WebSocket from 'ws';
// tslint:disable-next-line:no-duplicate-imports
import { AddressInfo } from 'ws';
import express from 'express';
import { v4 as uuid } from 'uuid';

interface IdentifiableWebsocketClient extends WebSocket {
	id: string;
}

export class WebsocketProducer {

	private static server: http.Server;
	private static wss: WebSocket.Server;
	private static connectedSockets: IdentifiableWebsocketClient[] = []; // List of connected clients

	public static setup = (app: express.Application): void => {
		WebsocketProducer.server = http.createServer(app);
		WebsocketProducer.wss = new WebSocket.Server({ server: WebsocketProducer.server });

		WebsocketProducer.wss.on('connection', (ws: IdentifiableWebsocketClient): void => {
			ws.id = uuid();
			WebsocketProducer.connectedSockets.push(ws);

			ws.on('message', (message: string): void => {
				console.log('Received: %s', message);
				ws.send(`RE: ${message}`);
			});

			ws.send(`Connected to the trader bot service. Connected Client Id: ${ws.id}`);
			ws.send(JSON.stringify({ clientSocketId: ws.id }));
		});

		WebsocketProducer.wss.on('close', (ws: WebSocket): void => {
			console.log(WebsocketProducer.connectedSockets);
			console.log('Connection closed');
		});

		WebsocketProducer.wss.on('unexpected-response', (ws: WebSocket): void => {
			console.log('Unexpected Response in Websocket Producer');
		});

		WebsocketProducer.wss.on('ping', (ws: WebSocket): void => {
			console.log('Websocket Producer Ping');
		});

		WebsocketProducer.wss.on('pong', (ws: WebSocket): void => {
			console.log('Websocket Producer Pong');
		});

		WebsocketProducer.wss.on('error', (ws: WebSocket): void => {
			console.log('Websocket Producer Error');
		});

		WebsocketProducer.server.listen(process.env.PORT || 8999, (): void => {
			if (WebsocketProducer.server.address() && (WebsocketProducer.server.address() as AddressInfo).port)
				console.log(`Server started on port ${(WebsocketProducer.server.address() as AddressInfo).port} :)`);
			else
				console.log('Server not started');
		});
	}

	public static send = (msg: string, clientId: string): void => {
		const clientSocket: IdentifiableWebsocketClient | undefined =
			WebsocketProducer.connectedSockets.find((s: IdentifiableWebsocketClient): boolean => s.id === clientId);

		try {
			if (clientSocket) WebsocketProducer.produceMessage(clientSocket, msg);
		} catch (e) {
			console.error(`The error likely occurred because there are no clients subscribed to the Websocket. Error: ${e.message}`);
		}
	}

	public static sendMultiple = (msg: string, clientIds: string[]): void => {
		clientIds.map((clientId: string): void => {
			const clientSocket: IdentifiableWebsocketClient | undefined =
				WebsocketProducer.connectedSockets.find((s: IdentifiableWebsocketClient): boolean => s.id === clientId);

			if (clientSocket) WebsocketProducer.produceMessage(clientSocket, msg);
		});
	}

	public static broadcast = (msg: string): void => {
		WebsocketProducer.connectedSockets.map((client: IdentifiableWebsocketClient): void => {
			WebsocketProducer.produceMessage(client, msg);
		});
	}

	private static produceMessage = (client: IdentifiableWebsocketClient, msg: string): void => {
		try {
			if (client.CLOSED) console.log(`Connection ${client.id} is closed`);
			if (client.OPEN) {
				console.log(`Connection ${client.id} is open`);
				client.send(msg);
			}
		} catch (e) {
			console.error(`The error likely occurred because there are no clients subscribed to the Websocket. Error: ${e.message}`);
		}
	}

}
