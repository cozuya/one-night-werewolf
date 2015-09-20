'use strict';

let Chatroom = require('../models/chatroom');

module.exports = () => {
	let chats = [],
		users = [],
		userCount = 0,
		sendChats = () => {
			io.emit('chatsEmit', chats);
		},
		sendUsers = () => {
			io.emit('usersEmit', users);
		},
		initialConnection = true,
		chatroom;

	io.on('connection', (socket) => {
		if (socket.handshake.session.passport && Object.keys(socket.handshake.session.passport).length > 0) {
			socket.userName = socket.handshake.session.passport.user;
			socket.userIndex = userCount;
			userCount++;
			users.push({
				userName: socket.userName,
				wasMentioned: false
			});
			sendUsers();

			if (initialConnection) {
				initialConnection = false;
				chatroom = new Chatroom({
					createdBy: socket.userName,
					createdAt: new Date()
				});
				chatroom.save();
			}
		} else {
			socket.userName = null;
		}

		socket.on('disconnect', () => {
			if (socket.userName) {
				users.splice(socket.userIndex, 1);
				userCount--;
				if (userCount === 0) {
					chatroom.closedAt = new Date();
					chatroom.chats = chats;
					chatroom.save();
				}
				sendUsers();
			}
		});

		socket.on('getChats', sendChats);

		socket.on('newChat', (chat) => {
			if (socket.userName) {
				chats.push({
					author: socket.userName,
					chatMsg: chat
				});
				sendChats();
			}
		});

		socket.on('mentionedUser', (mentionedUser) => {
			for (let user of users) {
				if (user.userName === mentionedUser) {
					user.wasMentioned = true;
					sendUsers();
					setTimeout(() => {
						user.wasMentioned = false;
						sendUsers();
					}, 2000);
				}
			}
		});

		socket.on('getUsers', sendUsers);
	});
};