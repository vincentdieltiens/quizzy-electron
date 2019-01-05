import { Component } from '@angular/core';
import { GameService } from './game.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppComponent {
	title = 'quizzy';

	constructor(game: GameService) {

	}
}
