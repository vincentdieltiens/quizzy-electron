export type screenType = 'home' | 'teams' | 'rounds' | 'settings';

export class GameState {
	buzzer: boolean = false;
	screen: screenType = 'home';
	roundIndex?: number;
	questionIndex?: number;
	rounds: any;

	teams = [
		{
			name: "A",
			image: 'team-A.png',
			active: false,
			buzzed: false,
			blocked: false,
			points: 0
		},
		{
			name: "B",
			image: 'team-B.png',
			active: false,
			buzzed: false,
			blocked: false,
			points: 0
		},
		{
			name: "C",
			image: 'team-C.png',
			active: false,
			buzzed: false,
			blocked: false,
			points: 0
		},
		{
			name: "D",
			image: 'team-D.png',
			active: false,
			buzzed: false,
			blocked: false,
			points: 0
		}
	];
}

export function updateState(state: any, value: any): any {

	//console.log('updateState : ', state, value);
	for(let key of Object.keys(value)) {
		let keyValue = value[key];
		if (Array.isArray(keyValue)) {
			// using || [] handle case when original state doesn't have the key
			state[key] = updateState(state[key] || [], value[key]);
		} else if (typeof keyValue == 'object') {
			// using || [] handle case when original state doesn't have the key
			state[key] = updateState(state[key] || {}, value[key]);
		} else {
			// primitive value
			//console.log('set value for key ', key, value[key]);
			state[key] = value[key];
		}
	}

	return state;

	/*if (path) {

		let keys = path.split('.');
		let subState = state;
		for(const [i, key] of keys.entries()) {
			console.log('look for key : ', key, subState[key]);
			subState = subState[key];

			if (i == keys.length-1) {
				console.log('last key. Set value');
				if (Array.isArray(value)) {
					console.log('is array. Concat : ', subState[key].contact(value));
					subState[key] = subState[key].concat(value);
				} else if (typeof value == 'object') {
					console.log('is object. Extend : ', { ...subState[key], ...value });
					subState[key] = { ...subState[key], ...value };
				}else {
					console.log('is primtive : ', value);
					subState[key] = value;
				}

			}
		}

		return state;

	} else {
		return { ...state, ...value };
	}*/
}

