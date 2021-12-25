import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuizzyService } from '../../services/quizzy.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	constructor(
		private router: Router,
		public quizzy: QuizzyService
	) { }

	ngOnInit(): void {
	}

	settings($event) {
		$event.stopPropagation();
		$event.preventDefault();
		this.quizzy.getMaster().setState({ screen: 'settings' })
	}

}
