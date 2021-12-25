import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ElectronService } from '.';
import { GameState, updateState } from '../game-state';

@Injectable({
	providedIn: 'root'
})
export class GameService {
	/** This is the game state. It contains all the needed data of the game (teams informations, scores, questions, ...) */
	private state: GameState;

	private changeDetectorRef: ChangeDetectorRef;

	private _stateChanged = new BehaviorSubject<Partial<GameState>>({});
	public stateChanged = this._stateChanged.asObservable();

	constructor(
		private electronService: ElectronService,
		private router: Router
	) {
		this.state = new GameState();
	}

	init() {
		this.readStateEvents();
	}

	readStateEvents() {
		if (!this.electronService.isElectron) {
			return
		}

		this.electronService.ipcRenderer.on('updateState', (event: Electron.IpcRendererEvent, args: any[]) => {
			console.log('state updated', args);
			this.setState(args);
			setTimeout(() => {
				this.changeDetectorRef.detectChanges();
			});
		});
	}

	loadScreen() {
		console.log('loadscreen : ', this.state.screen);

		switch(this.state.screen) {
			case 'home':
				this.router.navigateByUrl('');
				break;
			case 'teams':
				this.router.navigateByUrl('/teams');
				break;
			case 'rounds':
				this.router.navigateByUrl(`/rounds/${this.state.roundIndex}`);
				break;
		}
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

	roundsLoaded() {
		return this.state && this.state.rounds;
	}

	getCurrentRound() {
		if (this.state.rounds && this.state.roundIndex !== null) {
			return this.state.rounds[this.state.roundIndex];
		}
		return null;
	}

	/************************************************************
	 * 				STATE
	 ************************************************************/
	setState(state: any) {

		this.state = updateState(this.state || {}, state);

		if (state.screen) {
			this.loadScreen();
		}

		this._stateChanged.next(state);
	}

	getState() {
		return this.state;
	}

	/************************************************************
	 * 				ANGULAR
	 ************************************************************/

	setChangeDetectorRef(ref: ChangeDetectorRef) {
		this.changeDetectorRef = ref;
	}

}