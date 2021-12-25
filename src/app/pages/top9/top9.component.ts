import { Component, Input, OnInit } from '@angular/core';
import { QuizzyService } from '../../services/quizzy.service';

@Component({
	selector: 'app-top9',
	templateUrl: './top9.component.html',
	styleUrls: ['./top9.component.scss']
})
export class Top9Component implements OnInit {

	@Input('round') round: any;

	question?: any;

	constructor(public quizzy: QuizzyService) {
	}

	ngOnInit(): void {
		this.question = this.round.questions[this.quizzy.getState().questionIndex];
	}

	addPoint(teamIndex: number, pointsToAdd) {
		this.quizzy.getMaster().addTeamPoints(teamIndex, pointsToAdd);
	}

	wrongAnswer() {
		this.quizzy.getMaster().wrongAnswer();
	}

	nextQuestion() {
		this.quizzy.getMaster().nextQuestion();
		this.question = this.round.questions[this.quizzy.getState().questionIndex];
	}

	unblockAll() {
		//this.qui
	}
}
