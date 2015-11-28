'use strict';

import { combineReducers } from 'redux';

let userName = (state = '', action) => {
	switch (action.type) {
		// case userName:
		// 	return state.userName = action.userName;
		default:
			return state;
	}
};

export default combineReducers({
	userName
});