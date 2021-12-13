import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Electron } from 'playwright';
import { ElectronService } from '.';
import { GameState } from '../game-state';

@Injectable({
	providedIn: 'root'
})
export class GameService {

	private type?: 'game' | 'master';

	/** This is the game state. It contains all the needed data of the game (teams informations, scores, questions, ...) */
	private state: GameState;

	private changeDetectorRef: ChangeDetectorRef;

	constructor(
		private electronService: ElectronService
	) {
		this.state = new GameState();
	}

	init() {
		if (this.isGame()) {
			this.readStateEvents();
		} else {
			this.readBuzzerEvents();

			this.loadStateFromFile().then(() => {
				console.log('State file loaded!');
				this.getBuzzerState().then(isConnected => {}).catch(err => {
					console.log(err);
				});
			}).catch(err => {
				console.log('State file not loaded : ', err);
			});
		}


	}

	setType(type: 'game' | 'master') {
		this.type = type;
	}

	setChangedDetectorRef(ref) {
		this.changeDetectorRef = ref;
	}

	isMaster(): boolean {
		return this.type == 'master';
	}

	isGame(): boolean {
		return this.type == 'game';
	}

	/************************************************************
	 * 				STATE
	 ************************************************************/

	/*
	 * State
	 */
	setState(state: any, save = true) {
		console.log('set state : ', state);
		let newState = { ...this.state };
		for(let [key, value] of Object.entries(state)) {
			if (state.hasOwnProperty(key)) {
				newState[key] = value;
			}
		}
		this.state = newState;

		if (save) {
			this.saveStateToFile();
		}

		if (this.isMaster()) {
			this.sendStateToGame();
		}
	}

	getState() {
		return this.state;
	}

	loadStateFromFile() {
		const file = './data/current-game.json';
		return new Promise((resolve, reject) => {

			this.electronService.fs.readFile(file, (err, data: Buffer) => {
				if (err) {
					console.log('Error reading state json file ; ', err);
					reject(err);
					return;
				}
				this.setState(JSON.parse(data.toString()), false);
				resolve(this.getState());
			});
		});
	}

	readStateEvents() {
		if (!this.electronService.isElectron) {
			return
		}

		console.log('read updateState events')

		this.electronService.ipcRenderer.on('updateState', (event: Electron.IpcRendererEvent, args: any[]) => {
			console.log('updateState received !');
			this.setState(args);
			this.changeDetectorRef.detectChanges();
			console.log('state updated', args);
		});
	}

	sendStateToGame() {
		if (!this.electronService.isElectron) {
			return
		}

		console.log('send updateState to game')
		this.electronService.ipcRenderer.send('updateState', this.getState());
	}

	/**
	 *
	 * @returns
	 */
	saveStateToFile() {
		const file = './data/current-game.json';
		return new Promise((resolve, reject) => {
			this.electronService.fs.writeFile(file, JSON.stringify(this.getState()), null, (err) => {
				if (err) {
					console.log('error saving state json file : ', err);
					reject(err);
					return;
				}
				resolve('saved');
			});
		})
	}

	/************************************************************
	 * 				BUZZER
	 ************************************************************/

	/**
	 * Reads the buzzer events (connection, disconnection, buzz pressed)
	 */
	readBuzzerEvents() {
		if (!this.electronService.isElectron) {
			return
		}

		this.electronService.ipcRenderer.on('buzzerConnected', (event: Electron.IpcRendererEvent, args: any[]) => {
			this.setState({
				buzzer: args ? true : false
			});
			this.changeDetectorRef.detectChanges();
			console.log('buzzer connected', args);
		});
		this.electronService.ipcRenderer.on('buzzerPressed', (event: Electron.IpcRendererEvent, args: any[]) => {
			console.log('message received');
		});
	}

	getBuzzerState(timeout = 5000) {
		return new Promise((resolve, reject) => {
			let _timeout = setTimeout(() => {
				reject('Can\'t get buzzer state');
			});
			this.electronService.ipcRenderer.once('buzzerConnected', (event: Electron.IpcRendererEvent, args: any[]) => {
				clearTimeout(_timeout);
				resolve(args ? true : false);
				this.changeDetectorRef.detectChanges();
			});
			this.electronService.ipcRenderer.send('getBuzzerState', null);
		});
	}
}
