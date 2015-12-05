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

export const UPDATE_GAMELIST = 'UPDATE_GAMELIST';

export function updateGamelist(gameList) {
	return {
		type: UPDATE_GAMELIST,
		gameList
	}
}

export const UPDATE_GAMEINFO = 'UPDATE_GAMEINFO';

export function updateGameInfo(gameInfo) {
	return {
		type: UPDATE_GAMEINFO,
		gameInfo
	}
}