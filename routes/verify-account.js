'use strict';

const passport = require('passport'),
	Account = require('../models/account'),
	nodemailer = require('nodemailer'),
	mg = require('nodemailer-mailgun-transport');

let tokens = [];

module.exports = {
	setRoutes() {
		
		Account.find({'verification.verificationTokenExpiration': {$gte: new Date()}}, (err, accounts) => {
			tokens = accounts.map((account) => {
				return {
					username: account.username,
					token: account.verification.verificationToken,
					expires: account.verification.verificationTokenExpiration
				};
			});
		});

		app.get('/verify-account/:user/:token', (req, res) => {
			const token = tokens.find((toke, i) => {
				return toke.token === req.params.token;
			});
			console.log(tokens);
			console.log(req.user);

			if (token && token.expires >= new Date() && req.user.username === req.params.user) {
				Account.findOne({username: token.username}, (err, account) => {
					account.verified = true;
					account.verification.verificationTokenExpiration = null;
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

			const tomorrow = new Date(),
				token = `${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
				nmMailgun = nodemailer.createTransport(mg({
					auth: {
						api_key: process.env.MGKEY,
						domain: 'onenightwerewolf.online'
					}
				}));

			tomorrow.setDate(tomorrow.getDate() + 1);
			account.verification.verificationToken = token;
			account.verification.verificationTokenExpiration = tomorrow;
			tokens.push({
				username,
				token,
				expires: tomorrow
			});
			nmMailgun.sendMail({
				from: 'OneNightWerewolf <admin@onenightwerewolf.online>',
				// to: email,
				to: '1nwwtest@mailinator.com',
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