import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RoundsComponent } from './pages/rounds/rounds.component';
import { TeamsComponent } from './pages/teams/teams.component';

const routes: Routes = [
	{
		path: '',
		component: HomeComponent
	},
	{
		path: 'teams',
		component: TeamsComponent
	},
	{
		path: 'rounds/:index',
		component: RoundsComponent
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
