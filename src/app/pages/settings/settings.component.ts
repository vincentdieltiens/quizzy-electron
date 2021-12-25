import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { QuizzyService } from '../../services/quizzy.service';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

	form: FormGroup;

	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private quizzy: QuizzyService
	) {
		this.form = formBuilder.group({
			musics: [false],
			sounds: [false]
		});
		this.form.patchValue(this.quizzy.getMaster().getSettings());
	}

	ngOnInit(): void {
	}

	cancel() {
		this.goToHome();
	}

	save() {
		this.quizzy.getMaster().setSettings(this.form.value);
		this.goToHome();
	}

	goToHome() {
		this.quizzy.getMaster().setState({
			screen: 'home'
		});
	}

}
