export type screenType = 'home' | 'teams' | 'rounds';

export class GameState {
	buzzer: boolean = false;
	screen: screenType = 'home';
	round?: number;
	rounds: any;

	teams = [
		{
			name: "A",
			image: 'team-A.png',
			active: false
		},
		{
			name: "B",
			image: 'team-B.png',
			active: false
		},
		{
			name: "C",
			image: 'team-C.png',
			active: false
		},
		{
			name: "D",
			image: 'team-D.png',
			active: false
		}
	];
}