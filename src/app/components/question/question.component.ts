import { Component, Input, OnInit } from '@angular/core';
import { QuizzyService } from '../../services/quizzy.service';

@Component({
	selector: 'app-question',
	templateUrl: './question.component.html',
	styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {

	@Input('question') question;

	constructor(
		public quizzy: QuizzyService
	) {}

	ngOnInit(): void {
	}

}
