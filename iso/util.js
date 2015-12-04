'use strict';

export const defaultRolesArray = ['werewolf', 'werewolf', 'seer', 'robber', 'troublemaker', 'insomniac', 'hunter', 'villager', 'villager', 'villager'];

export const roleMap = {
	werewolf: {
		initial: 'WW',
		team: 'werewolf'
	},
	minion: {
		initial: 'Mi',
		team: 'werewolf'
	},
	mason: {
		initial: 'Ma',
		team: 'village'
	},
	seer: {
		initial: 'S',
		team: 'village'
	},
	robber: {
		initial: 'R',
		team: 'village'
	},
	troublemaker: {
		initial: 'TM',
		team: 'village'
	},
	hunter: {
		initial: 'H',
		team: 'village'
	},			
	tanner: {
		initial: 'T',
		team: 'tanner'
	},
	insomniac: {
		initial: 'I',
		team: 'village'
	},
	villager: {
		initial: 'V',
		team: 'village'
	}
};