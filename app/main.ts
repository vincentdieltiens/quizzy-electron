import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import { Buzzer } from './buzzer/buzzer';

const args = process.argv.slice(1),
	serve = args.some(val => val === '--serve');

let gameWindow: BrowserWindow = null;
let masterWindow: BrowserWindow = null;
let buzzer: Buzzer = null;

function createGameWindow(): BrowserWindow {

	const electronScreen = screen;
	const displays = screen.getAllDisplays()
	const externalDisplay = displays.find((display) => {
		return display.bounds.x !== 0 || display.bounds.y !== 0
	}) || screen.getPrimaryDisplay();
	const size = externalDisplay.workAreaSize;

	// Create the browser window.
	gameWindow = new BrowserWindow({
		x: externalDisplay.bounds.x,
		y: externalDisplay.bounds.y,
		width: size.width,
		height: size.height,
		webPreferences: {
			nodeIntegration: true,
			allowRunningInsecureContent: (serve) ? true : false,
			contextIsolation: false,  // false if you want to run e2e test with Spectron
		},
		fullscreen: false,
		show: false // don't show yet, it will be shown on `ready-to-show` event
	});

	if (serve) {
		gameWindow.webContents.openDevTools();
		require('electron-reload')(__dirname, {
			electron: require(path.join(__dirname, '/../node_modules/electron'))
		});
		gameWindow.loadURL('http://localhost:4567');
	} else {
		// Path when running electron executable
		let pathIndex = './index.html';

		if (fs.existsSync(path.join(__dirname, '../dist/game/game.html'))) {
			// Path when running electron in local folder
			pathIndex = '../dist/game/game.html';
		}

		gameWindow.loadURL(url.format({
			pathname: path.join(__dirname, pathIndex),
			protocol: 'file:',
			slashes: true
		}));
	}

	gameWindow.once('ready-to-show', () => {
		gameWindow.show()
	});

	// Emitted when the window is closed.
	gameWindow.on('closed', () => {
		// Dereference the window object, usually you would store window
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		gameWindow = null;
	});

	return gameWindow;
}

function createMasterWindow(): BrowserWindow {

	const electronScreen = screen;
	const size = electronScreen.getPrimaryDisplay().workAreaSize;

	// Create the browser window.
	masterWindow = new BrowserWindow({
		x: 0,
		y: 0,
		width: size.width,
		height: size.height,
		webPreferences: {
			nodeIntegration: true,
			allowRunningInsecureContent: (serve) ? true : false,
			contextIsolation: false,  // false if you want to run e2e test with Spectron
		},
		fullscreen: false,
		show: false // don't show yet, it will be shown on `ready-to-show` event
	});

	if (serve) {
		masterWindow.webContents.openDevTools();
		require('electron-reload')(__dirname, {
			electron: require(path.join(__dirname, '/../node_modules/electron'))
		});
		masterWindow.loadURL('http://localhost:4568');
	} else {
		// Path when running electron executable
		let pathIndex = './index.html';

		if (fs.existsSync(path.join(__dirname, '../dist/master/master.html'))) {
			// Path when running electron in local folder
			pathIndex = '../dist/master/master.html';
		}

		masterWindow.loadURL(url.format({
			pathname: path.join(__dirname, pathIndex),
			protocol: 'file:',
			slashes: true
		}));
	}


	masterWindow.once('ready-to-show', () => {
		masterWindow.show();
		if (buzzer) {
			// If buzzer is already connected, tell it to master
			masterWindow.webContents.send('buzzerConnected', true);
		}
	});

	// Sometimes, the game need to know the state of the buzzer, then it will send the `getBuzzerState` event
	// and will wait for a `buzzerdConnected` event
	ipcMain.on('getBuzzerState', (event, args) => {
		masterWindow.webContents.send('buzzerConnected', buzzer !== null);
	});

	// When the master want to update the state of the game, it will send the `updateState` event
	// That event is propagated to the game
	ipcMain.on('updateState', (event, args) => {
		console.log('update state');
		gameWindow.webContents.send('updateState', args);
	});

	// Emitted when the window is closed.
	masterWindow.on('closed', () => {
		// Dereference the window object, usually you would store window
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		masterWindow = null;
	});

	return masterWindow;
}

function initBuzzer() {
	// All buzzer events are sent to the master
	console.log('Init buzzer');
	const _buzzer = new Buzzer();
	_buzzer.connect().catch(err => {
		console.log('Buzzer error');
		buzzer = null;
		masterWindow.webContents.send('buzzerConnected', false);
	});

	_buzzer.addEventListener('ready', () => {
		console.log('Buzzer ready');
		for(var i=0; i < 4; i++) {
			_buzzer.lightOff(i);
		}
		buzzer = _buzzer;
		masterWindow.webContents.send('buzzerConnected', true);
	});

	_buzzer.addEventListener('leave', () => {
		console.log('Buzzer leave');
		buzzer = null;
		masterWindow.webContents.send('buzzerConnected', false);
		_buzzer.connect().catch(err => {
			buzzer = null;
		});
	});

	_buzzer.addEventListener('press', (controllerIndex: number) => {
		console.log('Buzzer press');
		_buzzer.lightOn(controllerIndex);
		masterWindow.webContents.send('buzzerPressed', controllerIndex);
	});
	console.log('Buzzer initalized');
}

try {
	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	// Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
	app.on('ready', () => {
		createGameWindow();
		createMasterWindow();
		initBuzzer();
	});

	// Quit when all windows are closed.
	app.on('window-all-closed', () => {
		// On OS X it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});

	app.on('activate', () => {
		// On OS X it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (gameWindow === null) {
			createGameWindow();
			createMasterWindow();
			initBuzzer();
		}
	});

} catch (e) {
	// Catch Error
	// throw e;
}
