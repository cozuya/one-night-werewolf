'use strict';

export const UPDATE_USER = 'UPDATE_USER';

export function updateUser(user) {
	return {
		type: UPDATE_USER,
		user
	}
}

export const UPDATE_MIDSECTION = 'UPDATE_MIDSECTION';

export function updateMidsection(midsection) {
	return {
		type: UPDATE_MIDSECTION,
		midsection
	}
}