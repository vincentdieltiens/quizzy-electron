import { Component, HostListener, OnInit } from '@angular/core';
import { QuizzyService } from '../../services/quizzy.service';

const ESCAPE_KEYCODE = 27;

@Component({
	selector: 'app-teams',
	templateUrl: './teams.component.html',
	styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit {

	currentTeamIndex = null;
	teamBox = false;
	name: string = null;

	@HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
		if (event.keyCode === ESCAPE_KEYCODE) {
			// ...
			this.teamBox = false;
		}
	}

	constructor(public quizzy: QuizzyService) { }

	ngOnInit(): void {
	}

	openNameBox(i) {
		console.log('openNameBox', i)
		if (this.quizzy.isMaster()) {
			this.name = this.quizzy.getState().teams[i].name;
			this.teamBox = true;
			this.currentTeamIndex = i;
		}
	}

	setTeamName() {
		console.log('set team name : ', this.currentTeamIndex, this.name);
		this.quizzy.getMaster().setTeamName(this.currentTeamIndex, this.name);
		this.teamBox = false;
	}

}
