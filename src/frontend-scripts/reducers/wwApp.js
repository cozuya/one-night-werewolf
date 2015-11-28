'use strict';

import { combineReducers } from 'redux';
import { UPDATE_USER, updateUser } from '../actions/actions.js';
import { UPDATE_MIDSECTION, updateMidsection} from '../actions/actions.js';

let userName = (state = '', action) => {
	switch (action.type) {
		case UPDATE_USER:
			return state = action.user;
		default:
			return state;
	}
};

let midSection = (state = 'default', action) => {
	switch (action.type) {
		case UPDATE_MIDSECTION:
			return state = action.midsection
		default:
			return state;
	}
};

export default combineReducers({
	userName,
	midSection
});