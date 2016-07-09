'use strict';

const passport = require('passport'),
	Account = require('../models/account'),
	nodemailer = require('nodemailer'),
	mg = require('nodemailer-mailgun-transport'),
	tokens = [];

module.exports = {
	setRoutes() {
		
		// const query = Account.find({

		// });

		// console.log(query);

		app.get('/verify-account/:user/:token', (req, res) => {
			const token = tokens.find((toke, i) => {
				return toke.token === req.params.token;
			});

			if (token && token.expires >= new Date() && req.user === req.params.user) {
				Account.findOne({username: token.username}, (err, account) => {
					account.verified = true;
					account.verification.verificationTokenExpiration = new Date();
					account.save(() => {
						res.redirect('/account');
						tokens.splice(tokens.findIndex((toke) => {
							return toke.token === req.params.token;
						}), 1);
					});
				});
			} else {
				res.render('404');
			}
		});
	},
	sendToken(username, email) {
		Account.findOne({username}, (err, account) => {
			if (err) {
				console.log(err);
			}

			const tomorrow = new Date,
				token = `${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
				nmMailgun = nodemailer.createTransport(mg({
					auth: {
						api_key: process.env.MGKEY,
						domain: 'onenightwerewolf.online'
					}
				}));

			tomorrow.setDate(tomorrow.getDate() + 1);
			account.verification.verificationTokenExpiration = tomorrow;
			tokens.push({
				username,
				token,
				expires: tomorrow
			});
			nmMailgun.sendMail({
				from: 'OneNightWerewolf <admin@onenightwerewolf.online>',
				// to: email,
				to: 'blindstealer@gmail.com',
				subject: 'Test email subject',
				'h:Reply-To': 'chris.v.ozols@gmail.com',
				// html: `<a href="https://onenightwerewolf.online/verify-account/${username}/${token}">click here</a>`
				html: `<a href="http://localhost:8080/verify-account/${username}/${token}">click here</a>`
			}, (err) => {
				if (err) {
					console.log(err);
				}
			});

			account.save();
		});
	}
};