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

		if (this.quizzy.getService().roundsLoaded()) {
			this.round = this.quizzy.getService().getCurrentRound();
		}

		this.quizzy.getService().stateChanged.subscribe(stateChange => {
			if (stateChange.rounds) {
				this.round = this.quizzy.getMaster().getCurrentRound();
				console.log('ROUNDS : ', this.round);
			}
		});

	}

}
