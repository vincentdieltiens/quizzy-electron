import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { GameService } from '../game.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-preferences',
	templateUrl: './preferences.component.html',
	styleUrls: ['./preferences.component.less']
})
export class PreferencesComponent implements OnInit {
	preferencesForm: FormGroup;

	constructor(private game: GameService, private router: Router) {
		this.preferencesForm = new FormGroup({
			port: new FormControl(game.preferences.port)
		});
	}

	ngOnInit() {
	}

	cancel() {
		this.router.navigate(['']);
	}

	save() {
		this.router.navigate(['']);
	}
}
