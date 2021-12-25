import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Console } from 'console';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from '.';
import { GameState, updateState } from '../game-state';
import { QuestionLoaderService } from './question-loader.service';
import { Howl, Howler } from 'howler';


@Injectable({
	providedIn: 'root'
})
export class MasterService {

	private state: GameState;
	private changeDetectorRef: ChangeDetectorRef;

	// The current listener for the buzzer
	private buzzerListener: any;

	private _stateChanged = new BehaviorSubject<Partial<GameState>>({});
	public stateChanged = this._stateChanged.asObservable();


	public _answer = new BehaviorSubject<any>(null);
	public answer = this._answer.asObservable();

	public music: Howl;
	public currentMusicId : any;
	public settings = {
		sounds: true,
		musics: true
	};

	constructor(
		private electronService: ElectronService,
		private router: Router,
		private questionsLoader: QuestionLoaderService
	) {
	}

	init() {
		this.loadSettingsFromFile().then(() => {
			console.log('settings loaded');
			// Set an empty state, without saving it (to not overwrite the last state saved that we maybe start from)
			this.setState(new GameState(), false);

			// Watch for buzzer connection
			this.readBuzzerEvents();
		});
	}

	loadScreen() {
		console.log('loadscreen : ', this.state.screen);

		// If there already is a listener for the buzzer press, unregister it
		if (this.buzzerListener) {
			this.electronService.ipcRenderer.removeListener('buzzerPressed', this.buzzerListener);
		}

		if (this.settings.musics && this.currentMusicId) {
			this.music.fade(1, 0, 500, this.currentMusicId);
		}

		switch(this.state.screen) {
			case 'home':
				this.router.navigateByUrl('');

				if (this.settings.musics) {
					this.music = new Howl({
						src: ['assets/sounds/game2.wav'],
						volume: 0.3
					});
					this.currentMusicId = this.music.play();
				}

				break;
			case 'settings':
				this.router.navigateByUrl('/settings');

				break;
			case 'teams':

				let sound;
				if (this.settings.sounds) {
					sound = new Howl({
						src: ['assets/sounds/activate_team.mp3'],
						volume: 0.3
					});

				}

				// At this step, teams need to activate themselves by pushing on the buzzer.
				// Listen for the buzzer to activate the teams
				this.buzzerListener = ((event: Electron.IpcRendererEvent, controllerIndex: number) => {
					let value = { teams: {} };
					value.teams[controllerIndex] = { active: true };

					if (this.settings.sounds) {
						sound.play();
					}

					this.setState(value);
					// IPC Events are run outside of Angular, we need to force the detect changes so that angular updates the app
					this.changeDetectorRef.detectChanges();
				}).bind(this);

				// Register the listener
				this.electronService.ipcRenderer.on('buzzerPressed', this.buzzerListener);

				this.router.navigateByUrl('/teams');

				break;
			case 'rounds':

				let round = this.getCurrentRound();

				if (round.type == 'top9') {
					this.loadRoundTop9(round);
				} else if (round.type == '421') {
					this.loadRound421(round);
				}

				this.router.navigateByUrl(`/rounds/${this.state.roundIndex}`);
				break;
		}
	}

	/************************************************************
	 * 				HOME
	 ************************************************************/

	startNewGame() {
		this.setState({
			screen: 'teams'
		});

		// When the questions are loaded, they are save to current game data
		this.questionsLoader.load('./data/questions.json').then(rounds => {
			console.log('=======>', rounds);
			this.setState({
				rounds: rounds
			});
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
	 * 				TEAMS
	 ************************************************************/

	 setTeamName(index, name) {
		let value = { teams : {} };
		value.teams[index] = { name: name };

		this.setState(value);
	}

	/************************************************************
	 * 				ROUNDS
	 ************************************************************/

	startFirstRound() {
		this.setState({
			screen: 'rounds',
			roundIndex: 0,
			questionIndex: 0
		});
	}

	roundsLoaded() {
		return this.state && this.state.rounds;
	}

	getCurrentRound() {
		if (this.state.rounds && this.state.roundIndex !== null) {
			return this.state.rounds[this.state.roundIndex];
		}
		return null;
	}

	addTeamPoints(teamIndex: number, pointsToAdd: number) {
		let round = this.getCurrentRound();
		let value = { rounds: [] };

		let points = round.points[teamIndex];

		value.rounds[this.state.roundIndex] = { points: [] };
		value.rounds[this.state.roundIndex].points[teamIndex] = points + pointsToAdd;

		this.setState(value);
	}

	loadRoundTop9(round: any) {
		let sound;
		if (this.settings.sounds) {
			sound = new Howl({
				src: [round.buzz_sound],
				volume: 0.3
			});
		}

		let value: any = {
			teams: [
				{ buzzed: false, blocked: false },
				{ buzzed: false, blocked: false },
				{ buzzed: false, blocked: false },
				{ buzzed: false, blocked: false }
			]
		};

		if (!round.points) {
			value.rounds = [];
			value.rounds[this.state.roundIndex] = {
				points: this.getState().teams.map(team => {
					return 0;
				})
			};
		}

		this.setState(value);

		this._answer.subscribe(answer => {
			if (answer == null) {
				// reset do nothing
				return;
			}

			if (answer) {
				let questionIndex = this.state.questionIndex;
				let value = {
					teams: [
						{ buzzed: false, blocked: false },
						{ buzzed: false, blocked: false },
						{ buzzed: false, blocked: false },
						{ buzzed: false, blocked: false }
					],
					questionIndex: questionIndex+1
				}

				this._answer.next(null);
				this.setState(value);
			} else {
				let teamIndex = this.state.teams.findIndex(team => team.buzzed);

				let value = {
					teams: []
				};
				value.teams[teamIndex] = { buzzed: false, blocked: true };

				this._answer.next(null);
				this.setState(value);
			}
		})

		this.buzzerListener = ((event: Electron.IpcRendererEvent, controllerIndex: number) => {

			// Check if no active buzz
			let buzzed = this.state.teams.filter(team => team.buzzed);
			console.log('buzz ! ', buzzed);
			if (buzzed.length > 0) {
				return;
			}

			// Check if team is not blocked
			let team = this.state.teams[controllerIndex];
			console.log('team : ', team);
			if (team.blocked) {
				return;
			}
			// Check team is active
			if (!team.active) {
				return;
			}

			let value = { teams: [] };
			value.teams[controllerIndex] = { buzzed: true };

			if (this.settings.sounds) {
				sound.play();
			}

			this.setState(value);

			// IPC Events are run outside of Angular, we need to force the detect changes so that angular updates the app
			this.changeDetectorRef.detectChanges();

		}).bind(this);

		// Register the listener
		this.electronService.ipcRenderer.on('buzzerPressed', this.buzzerListener);
	}

	loadRound421(round: any) {

	}

	wrongAnswer() {
		this._answer.next(false);
	}

	nextQuestion() {
		this._answer.next(true);
	}

	/************************************************************
	 * 				STATE
	 ************************************************************/
	setState(state: any, save = true) {

		this.state = updateState(this.state || {}, state);

		if (save) {
			this.saveStateToFile();
		}

		this._stateChanged.next(state);

		console.log('set state : ', state, save);

		// Send only the updated data
		this.sendStateToGame(state);

		if (state.screen) {
			this.loadScreen();
		}
	}

	getState() {
		return this.state;
	}

	sendStateToGame(state: any) {
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
		});
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
			}, false);
			this.changeDetectorRef.detectChanges();
			console.log('buzzer connected', args);
		});
		this.electronService.ipcRenderer.on('buzzerPressed', (event: Electron.IpcRendererEvent, args: any[]) => {
			console.log('message received');
		});
		this.electronService.ipcRenderer.send('getBuzzerState', null);
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
	 * 				SETTINGS
	 ************************************************************/

	getSettings() {
		return this.settings;
	}

	setSettings(settings: any, save = true) {
		this.settings = settings;
		if (save) {
			this.saveSettingsToFile();
		}
	}

	loadSettingsFromFile() {
		const file = './data/settings.json';
		return new Promise((resolve, reject) => {

			this.electronService.fs.readFile(file, (err, data: Buffer) => {
				if (err) {
					console.log('Error reading settings json file ; ', err);
					reject(err);
					return;
				}
				try {
					console.log('current settings loaded');
					this.setSettings(JSON.parse(data.toString()), true);
					resolve(this.getState());
				} catch (e) {
					reject(e.message);
				}
			});
		});
	}

	saveSettingsToFile() {
		const file = './data/settings.json';
		return new Promise((resolve, reject) => {
			this.electronService.fs.writeFile(file, JSON.stringify(this.getSettings()), null, (err) => {
				if (err) {
					//console.log('error saving state json file : ', err);
					reject(err);
					return;
				}
			});
		});
	}

	/************************************************************
	 * 				ANGULAR
	 ************************************************************/

	setChangeDetectorRef(ref: ChangeDetectorRef) {
		this.changeDetectorRef = ref;
	}

}