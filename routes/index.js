'use strict';

import mongoose from 'mongoose';
import passport from 'passport';

let Account = require('../models/account'),
	ensureAuthenticated = (req, res, next)  => {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	};

module.exports = () => {
	require('./chats')();
	require('./accounts')();

	app.get('/', (req, res) => {
		if (req.user) {
			res.render('signed-in');
		} else {
			res.render('signed-out');
		}
	});

	app.get('/game', ensureAuthenticated, (req, res) => {
		res.render('game');
	});

	app.get('/observe', (req, res) => {
		if (req.user) {
			req.session.destroy();
			req.logout();
		}
		res.render('game');
	});

	app.get('*', (req, res) => {
		res.render('404');
	});
};