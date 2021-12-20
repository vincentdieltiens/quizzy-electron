import { Injectable } from '@angular/core';
import { ElectronService } from '.';

@Injectable({
	providedIn: 'root'
})
export class QuestionLoaderService {
	constructor(
		private electronService: ElectronService
	) {

	}

	load(url: string) {
		const file = url;
		return new Promise((resolve, reject) => {
			this.electronService.fs.readFile(file, (err, data: Buffer) => {
				if (err) {
					console.log('Error reading state json file ; ', err);
					reject(err);
					return;
				}
				try {
					//console.log(data.toString());
					resolve(JSON.parse(data.toString()));
				} catch(e) {
					reject(e.message);
				}
			});
		});
	}
}