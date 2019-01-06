import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';

@Component({
	selector: 'app-questions-table',
	templateUrl: './questions-table.component.html',
	styleUrls: ['./questions-table.component.less']
})
export class QuestionsTableComponent implements OnInit {
	displayedColumns: string[] = ['file', 'type', 'title', 'artist', 'year'];
	questions: MatTableDataSource<any>;
	@ViewChild(MatSort) sort: MatSort;
	
	constructor() {
		this.questions = new MatTableDataSource([{
			file: 'test.mp3',
			type: 'blind',
			title: 'Test',
			artist: 'Vincent',
			year: 2019
		}, {
			file: 'coucou.mp3',
			type: 'blind',
			title: 'Coucou',
			artist: 'Emilie',
			year: 2018
		}]);
	}

	ngOnInit() {
		this.questions.sort = this.sort;
	}

	applyFilter(filterValue: string) {
		this.questions.filter = filterValue.trim().toLowerCase();
	}

}
