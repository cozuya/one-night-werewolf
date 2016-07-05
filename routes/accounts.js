'use strict';

let passport = require('passport'),
	Account = require('../models/account');

let ensureAuthenticated = (req, res, next)  => {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect('/');
	}
};

module.exports = () => {
	app.get('/account', ensureAuthenticated, (req, res) => {
		res.render('page-account', {username: req.user.username});
	});

	app.post('/account/change-password', ensureAuthenticated, (req, res) => {
		let newPassword = req.body.newPassword,
			newPasswordConfirm = req.body.newPasswordConfirm,
			user = req.user;

		if (newPassword !== newPasswordConfirm) {
			res.status(401).json({message: 'not equal'});
			return;
		}

		user.setPassword(newPassword, () => {
			user.save();
			res.send();
		});
	});

	app.post('/account/signup', (req, res, next) => {
		let username = req.body.username,
			password = req.body.password,
			password2 = req.body.password2,
			save = {
				username,
				gameSettings: {
					disablePopups: false,
					enableTimestamps: false,
					disableRightSidebarInGame: false
				},
				games: [],
				wins: 0,
				losses: 0,
				created: new Date()
			};

		if (!/^[a-z0-9]+$/i.test(username)) {
			res.status(401).json({message: 'Sorry, your username can only be alphanumeric.'});
		} else if (username.length < 3) {
			res.status(401).json({message: 'Sorry, your username is too short.'});
		} else if (username.length > 12) {
			res.status(401).json({message: 'Sorry, your username is too long.'});
		} else if (password.length < 7) {
			res.status(401).json({message: 'Sorry, your password is too short.'});
		} else if (password.length > 255) {
			res.status(401).json({message: 'Sorry, your password is too long.'});
		} else if (password !== password2) {
			res.status(401).json({message: 'Sorry, your passwords did not match.'});
		} else {
			Account.findOne({username}, (err, account) => {
				if (err) {
					return next(err);
				}
				
				if (account) {
					res.status(401).json({message: 'Sorry, that account already exists.'})
				} else {
					Account.register(new Account(save), password, (err) => {
						if (err) {
							return next(err);
						}

						passport.authenticate('local')(req, res, () => {
							res.send();
						});
					});
				}
			});
		}
	});

	app.post('/account/signin', passport.authenticate('local'), (req, res) => {
		res.send();
	});

	// app.post('/login', passport.authenticate('local'), (req, res, next) {
	// 		// issue a remember me cookie if the option was checked
	// 		if (!req.body.remember_me) { return next(); }

	// 		var token = utils.generateToken(64);
	// 		Token.save(token, { userId: req.user.id }, function(err) {
	// 		if (err) { return done(err); }
	// 		res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
	// 		return next();
	// 		});
	// 		},
	// 		function(req, res) {
	// 		res.redirect('/');
	// 		});

	app.post('/account/logout', ensureAuthenticated, (req, res) => {
		req.logOut();
		res.send();
	});

	// app.post('/account/delete-account', passport.authenticate('local'), (req, res) => {
				// todo-release
	// });
};