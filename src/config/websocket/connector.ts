import WebSocket, { MessageEvent } from 'isomorphic-ws';
import { Logger } from '../logger/logger';

export default class SocketConnection {

	private readonly websocket: WebSocket;

	public constructor(
		socketUrl: string,
		open: () => void,
		close: () => void,
		message: (msg: SocketMessage) => void,
		error: () => void
	) {
		this.websocket = new WebSocket(socketUrl);
		this.websocket.onopen = open;
		this.websocket.onclose = close;
		this.websocket.onmessage = message;
		this.websocket.onerror = error;
	}

	public SendData = (data: any): void => {
		try {
			const stringifiedData: string = JSON.stringify(data);
			this.websocket.send(stringifiedData);
		} catch (err) {
			Logger.info(`Unable to send message via websocket to ${this.websocket.url} - Error: ${err}`);
		}
	}

	public Close = (): void => this.websocket.close();

}

export type SocketMessage = MessageEvent;
