import { ChangeDetectorRef, Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Electron } from 'playwright';
import { ElectronService } from '.';
import { GameState } from '../game-state';
import { GameService } from './game.service';
import { MasterService } from './master.service';
import { QuestionLoaderService } from './question-loader.service';

@Injectable({
	providedIn: 'root'
})
export class QuizzyService {

	private type?: 'game' | 'master';

	/** This is the game state. It contains all the needed data of the game (teams informations, scores, questions, ...) */
	private state: GameState;

	private service: GameService | MasterService;

	constructor(
		private electronService: ElectronService,
		private router: Router,
		private questionLoader: QuestionLoaderService,
		private gameService: GameService,
		private masterService: MasterService
	) {
		this.state = new GameState();
	}

	init() {
		if (this.isGame()) {
			this.service = this.gameService;
		} else {
			this.service = this.masterService;
		}
		this.service.init();
	}

	/************************************************************
	 * 				TYPE
	 ************************************************************/

	setType(type: 'game' | 'master') {
		this.type = type;
	}

	isMaster(): boolean {
		return this.type == 'master';
	}

	isGame(): boolean {
		return this.type == 'game';
	}

	/************************************************************
	 * 				ANGULAR
	 ************************************************************/

	setChangeDetectorRef(ref) {
		this.service.setChangeDetectorRef(ref);
	}

	/************************************************************
	 * 				STATE
	 ************************************************************/

	getState() {
		return this.service.getState();
	}

	setState(state: Partial<GameState>) {
		this.service.setState(state);
	}

	getService() {
		return this.service;
	}

	getMaster(): MasterService {
		return this.service as MasterService;
	}

	getGame(): GameService {
		return this.service as GameService;
	}
}
