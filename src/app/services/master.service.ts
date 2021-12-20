import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '.';
import { GameState } from '../game-state';
import { QuestionLoaderService } from './question-loader.service';

@Injectable({
	providedIn: 'root'
})
export class MasterService {

	private state: GameState;
	private changeDetectorRef: ChangeDetectorRef;

	// The current listener for the buzzer
	private buzzerListener: any;


	constructor(
		private electronService: ElectronService,
		private router: Router,
		private questionsLoader: QuestionLoaderService
	) {
	}

	init() {
		this.setState(new GameState());
		this.readBuzzerEvents();

		// Todo : find a way to only run at app bootstrap
		//this.continueGame();
	}

	loadScreen() {
		console.log('loadscreen : ', this.state.screen);

		if (this.buzzerListener) {
			this.electronService.ipcRenderer.removeListener('buzzerPressed', this.buzzerListener);
		}

		switch(this.state.screen) {
			case 'home':
				this.router.navigateByUrl('');
				break;
			case 'teams':

				this.buzzerListener = ((event: Electron.IpcRendererEvent, controllerIndex: number) => {
					console.log('Buzzz');
					let teams = this.state.teams;
					teams[controllerIndex].active = true;
					this.setState({
						teams: teams
					});
					this.changeDetectorRef.detectChanges();
				}).bind(this);

				this.electronService.ipcRenderer.on('buzzerPressed', this.buzzerListener);

				this.router.navigateByUrl('/teams');

				break;
			case 'rounds':

				if (this.state.rounds == null) {
					this.questionsLoader.load('./data/questions.json').then(rounds => {
						console.log('=======>', rounds);
						this.setState({
							rounds: rounds
						});
					});
				}

				this.router.navigateByUrl(`/rounds/${this.state.round}`);
				break;
		}
	}

	setTeamName(index, name) {
		let teams = this.state.teams;
		teams[index].name = name;

		this.setState({
			teams: teams
		});
	}

	startNewGame() {
		this.setState({
			screen: 'teams'
		});
	}

	continueGame() {
		this.loadStateFromFile().then(() => {
			console.log('State file loaded');
		}).catch(err => {
			console.log('State file not loaded : ', err);
		}).finally(() => {
			// Do Something in both case
		});
	}

	/************************************************************
	 * 				ROUNDS
	 ************************************************************/

	startFirstRound() {
		this.setState({
			screen: 'rounds',
			round: 0
		});
	}

	getCurrentRound() {
		if (this.state.rounds && this.state.round !== null) {
			return this.state.rounds[this.state.round];
		}
		return null;
	}

	/************************************************************
	 * 				STATE
	 ************************************************************/
	setState(state: any, save = true) {
		this.state = { ...this.state, ...state };

		if (save) {
			this.saveStateToFile();
		}

		console.log('set state : ', state);

		// Send only the updated data
		this.sendStateToGame(state);

		if (state.screen) {
			this.loadScreen();
		}
	}

	getState() {
		return this.state;
	}

	sendStateToGame(state) {
		this.electronService.ipcRenderer.send('updateState', state);
	}

	saveStateToFile() {
		const file = './data/current-game.json';
		return new Promise((resolve, reject) => {
			this.electronService.fs.writeFile(file, JSON.stringify(this.getState()), null, (err) => {
				if (err) {
					//console.log('error saving state json file : ', err);
					reject(err);
					return;
				}
			});
		})
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
				try {
					console.log('current game loaded');
					this.setState(JSON.parse(data.toString()), false);
					resolve(this.getState());
				} catch (e) {
					reject(e.message);
				}
			});
		});
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

	/************************************************************
	 * 				ANGULAR
	 ************************************************************/

	setChangeDetectorRef(ref: ChangeDetectorRef) {
		this.changeDetectorRef = ref;
	}

}