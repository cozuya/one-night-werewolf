'use strict';

let mongoose = require('mongoose'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	Account = require('../models/account'),
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
			res.redirect('/game');
		} else {
			res.render('signed-out', {});
		}
	});

	app.get('/signin', (req, res) => {
		res.render('signup');
	});

	app.get('/signup', (req, res) => {
		res.render('signup');
	});

	app.get('/game', ensureAuthenticated, (req, res) => {
		res.render('game');
	});

	app.get('*', (req, res) => {
		res.render('404');
	});
};