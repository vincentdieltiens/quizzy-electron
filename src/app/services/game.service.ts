import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '.';
import { GameState } from '../game-state';

@Injectable({
	providedIn: 'root'
})
export class GameService {
	/** This is the game state. It contains all the needed data of the game (teams informations, scores, questions, ...) */
	private state: GameState;

	private changeDetectorRef: ChangeDetectorRef;

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
				this.router.navigateByUrl(`/rounds/${this.state.round}`);
				break;
		}
	}

	/************************************************************
	 * 				STATE
	 ************************************************************/
	setState(state: any) {
		this.state = { ...this.state, ...state };

		if (state.screen) {
			this.loadScreen();
		}
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