import { Component, OnInit } from '@angular/core';
import { QuizzyService } from '../../services/quizzy.service';

@Component({
	selector: 'app-rounds',
	templateUrl: './rounds.component.html',
	styleUrls: ['./rounds.component.scss']
})
export class RoundsComponent implements OnInit {

	round: any;

	constructor(
		private quizzy: QuizzyService
	) { }

	ngOnInit(): void {
		//this.round = this.gameService.getMaster().getCurrentRound();
		//console.log('ROUNDS : ', this.round);
	}

}
