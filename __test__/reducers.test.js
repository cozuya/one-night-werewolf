import combinedReducers from '../src/frontend-scripts/reducers/ww-app.js';

console.log(combinedReducers);

describe('reducers', () => {
	describe('mainReducer', function() {
		it('should return the initial state', () => {
			expect(combinedReducers(undefined, {})).toEqual({
				userInfo: {},
				midSection: 'default',
				gameList: [],
				gameInfo: {},
				userList: {},
				expandoInfo: 'empty',
				clickedGamerole: {},
				clickedPlayer: {},
				generalChats: []
			});
		});
	});
});