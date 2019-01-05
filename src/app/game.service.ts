import { Injectable } from '@angular/core';
import * as ws from 'nodejs-websocket';

@Injectable({
	providedIn: 'root'
})
export class GameService {
	server: ws.Server;
	conn: ws.Connection;

	constructor() {
		this.createServer(9000);
	}

	private createServer(port: number) {
		this.server = ws.createServer((conn) => {
			conn.on("text", (str) => {
				console.log('WS Server : error : ', str);
			});

			conn.on("close", (code, reason) => {
				console.log('WS Server : close : ', code, reason);
			});
		});

		this.server.listen(9000, () => {
			console.log('WS Server : listening')
		});
	}
}
