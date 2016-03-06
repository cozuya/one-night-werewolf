'use strict';

export const defaultRolesArray = ['werewolf', 'werewolf', 'seer', 'robber', 'troublemaker', 'insomniac', 'hunter', 'villager', 'villager', 'villager'];

export const roleList = ['werewolf', 'minion', 'mason', 'seer', 'robber', 'troublemaker', 'insomniac', 'hunter'];

export const roleMap = {
	werewolf: {
		initial: 'WW',
		team: 'werewolf',
		description: 'Werewolves wake up first, and look for other werewolves.  If there are none, they may look at a center card.  There is a minimum of 2 werewolves in every game, and a maximum of 5 werewolf team roles in every game.  Werewolves are on the <span>werewolf team.</span>'
	},
	minion: {
		initial: 'Mi',
		team: 'werewolf',
		description: 'Minions wake up, and get to see who the werewolves are - but the werewolves are not aware of who the minions are.  Minions win if the werewolves win, and in the event of no werewolves, win if a villager dies.  There is a maximum of 5 werewolf team roles in every game.  Minions are on the <span>werewolf team.</span>'
	},
	mason: {
		initial: 'Ma',
		team: 'village',
		description: 'Masons wake up, and look for other masons.  Masons are on the <span>village team.</span>'
	},
	seer: {
		initial: 'S',
		team: 'village',
		description: 'Seers wake up, and have the choice of looking at another player\'s card, or two of the center cards.  Seers are on the <span>village team.</span>'
	},
	robber: {
		initial: 'R',
		team: 'village',
		description: 'Robbers wake up, and look at another player\'s card.  They then swap that player\'s card with their own, and become the role and team they have stolen (and vice versa) - however they do not do an additional night action.  Robbers are on the <span>village team.</span>'
	},
	troublemaker: {
		initial: 'TM',
		team: 'village',
		description: 'Troublemakers wake up, and swap the cards of two players without looking at them.  Troublemakers are on the <span>village team.</span>'
	},
	hunter: {
		initial: 'H',
		team: 'village',
		description: 'Hunters do not wake up.  If a hunter is eliminated, the player he or she is selecting for elimination is also eliminated.  Hunters are on the <span>village team.</span>'
	},			
	tanner: {
		initial: 'T',
		team: 'tanner',
		description: 'Tanners do not wake up.  Tanners are suicidal and only win if they are eliminated.  There is a maximum of 3 tanners per game.  Tanners are on <span className="tanner-inner">their own team individually</span> and do not win if another tanner wins.'
	},
	insomniac: {
		initial: 'I',
		team: 'village',
		description: 'Insomniacs wake up, and look at their card again to see if they are still the insomniac.  Insomniacs are on the <span>village team.</span>'
	},
	villager: {
		initial: 'V',
		team: 'village',
		description: 'Villagers do not wake up.  Villagers are on the <span>village team.</span>'
	}
};