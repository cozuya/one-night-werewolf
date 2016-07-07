'use strict';

const passport = require('passport'),
	Account = require('../models/account'),
	ensureAuthenticated = (req, res, next)  => {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/observe');
		}
	},
	nodemailer = require('nodemailer'),
	mg = require('nodemailer-mailgun-transport');

module.exports = () => {
	app.get('/email', (req, res) => {
			auth = {
				auth: {
					api_key: process.env.MGKEY,
					domain: 'onenightwerewolf.online'
				}
			},
			nmMailgun = nodemailer.createTransport(mg(auth));

		nmMailgun.sendMail({
			from: 'OneNightWerewolf <admin@onenightwerewolf.online>',
			to: 'blindstealer@gmail.com',
			subject: 'Test email subject',
			'h:Reply-To': 'chris.v.ozols@gmail.com',
			html: '<h1>email!</h1>'
		}, (err, info) => {
			if (err) {
				console.log(err);
			}
		});
	});

	app.get('*', (req, res) => {
		res.render('404');
	});
};