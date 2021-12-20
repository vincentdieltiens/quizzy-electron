import { ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { ElectronService } from './services';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { QuizzyService } from './services/quizzy.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	constructor(
		private electronService: ElectronService,
		private translate: TranslateService,
		private elementRef: ElementRef,
		private quizzyService: QuizzyService,
		private changeDetectorRef: ChangeDetectorRef
	) {
		this.translate.setDefaultLang('en');
		//console.log('APP_CONFIG', APP_CONFIG);

		if (this.electronService.isElectron) {
			/*console.log(process.env);
			console.log('Run in electron');
			console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
			console.log('NodeJS childProcess', this.electronService.childProcess);*/
			console.log('Type : ', this.elementRef.nativeElement.getAttribute('type'));
			this.quizzyService.setType(this.elementRef.nativeElement.getAttribute('type'));
			this.quizzyService.init();
			this.quizzyService.setChangeDetectorRef(this.changeDetectorRef);
		} else {
			//console.log('Run in browser');
		}
	}
}
