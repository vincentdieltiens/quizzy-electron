import { Injectable } from '@angular/core';
import * as ws from 'nodejs-websocket';

class Preferences {
	port: number;
}

@Injectable({
	providedIn: 'root'
})
export class GameService {
	server: ws.Server;
	conn: ws.Connection;
	preferences: Preferences;

	constructor() {
		this.preferences = { port: 9000 };
		this.createServer(this.preferences.port);
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
