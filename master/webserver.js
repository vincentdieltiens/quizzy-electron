'use strict';

import express from 'express';
import path from 'path';

export function createHttpServer(port, webSocketPort) {
	let app = express();

	app.use(express.static(path.dirname(__filename)+'/public'));
	app.get('/', (req, res) => {
		return res.sendFile('index.html');
	});

	app.listen(port, () => {
		console.log('Web app : listening on '+port);
		console.log('Go to https://127.0.0.1:'+port);
	});
}