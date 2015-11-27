'use strict';

import mongoose from 'mongoose';
import passport from 'passport';
import Account from '../models/account';

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

			passport.authenticate('local')(req, res, () => {
				res.send();
			});
		});
	});

	app.post('/account/signin', passport.authenticate('local'), (req, res) => {
		res.send();
	});

	app.post('/account/logout', ensureAuthenticated, (req, res) => {
		req.logOut();
		res.send();
	});

	// app.post('/account/delete-account', passport.authenticate('local'), (req, res) => {
				// todo
	// });
};