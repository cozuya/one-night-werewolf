'use strict';

import mongoose from 'mongoose';
import passport from 'passport';
import Account from '../models/account';
import GameSettings from '../models/gamesettings';

let ensureAuthenticated = (req, res, next)  => {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect('/');
	}
};

export default () => {
	app.get('/account', ensureAuthenticated, (req, res) => {
		res.render('my-account');
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

	app.post('/account/signup', (req, res) => {
		let username = req.body.username,
			password = req.body.password;

		if (!/^[a-z0-9]+$/i.test(username)) {
			res.status(401).json({message: 'Sorry, your username can only be alphanumeric.'});
		}

		Account.register(new Account({username}), password, (err) => {
			if (err) {
				console.log(err);
			}

			let settings = new GameSettings({
				username,
				gameSettings: {
					disablePopups: false,
					enableTimestamps: false
				}
			});

			settings.save();

			passport.authenticate('local')(req, res, () => {
				res.send();
			});
		});
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
				// todo
	// });
};