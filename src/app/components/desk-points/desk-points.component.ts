import { Component, Input, OnDestroy, OnInit, SimpleChange } from '@angular/core';

@Component({
	selector: 'app-desk-points',
	templateUrl: './desk-points.component.html',
	styleUrls: ['./desk-points.component.scss']
})
export class DeskPointsComponent implements OnInit, OnDestroy {

	@Input('teamName') teamName: string;

	public _points = 0;
	public blinkAdd;
	public blinkRemove;
	public finished;

	@Input('points') set points(value) {
		this.blinkAdd = false;
		this.blinkRemove = false;
		this.finished = false;
		//console.log('set points for ' + this.teamName + '. Old: ' + this._points + " New: " + value);

		if (value > this._points) {
			this.blinkAdd = true;
			this._points = value;
		} else if (value < this._points) {
			this.blinkRemove = true;
			// Wait the end of the animation to decrease the value
			setTimeout(() => {
				//console.log('set new value');
				this.blinkRemove = false;
				this._points = value;
			}, 1200);
		}

		if (this._points == 9) {
			this.finished = true;
			this.blinkAdd = false;
			this.blinkRemove = false;
		}
	}

	get points(): number {
		return this._points;
	}

	constructor() { }

	ngOnInit(): void {
		//console.log('component initialized');
	}

	ngOnDestroy(): void {
		//console.log('component destroyed');
	}

}
