import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { environment } from '../environments/environment';
import { GameComponent } from './game/game.component';
import { PreferencesComponent } from './preferences/preferences.component';

const routes: Routes = [
	{ path: '', component: GameComponent },
	{ path: 'preferences', component: PreferencesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: environment.isElectron })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
