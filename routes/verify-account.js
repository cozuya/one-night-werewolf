'use strict';

const passport = require('passport'),
	Account = require('../models/account'),
	nodemailer = require('nodemailer'),
	mg = require('nodemailer-mailgun-transport');

module.exports = (req, res) => {
	const token = `${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
		nmMailgun = nodemailer.createTransport(mg({
			auth: {
				api_key: process.env.MGKEY,
				domain: 'onenightwerewolf.online'
			}
		}));

	Account.findOne({username: req.body.username}, (err, account) => {
		if (err) {
			console.log(err);
		}

		let tomorrow = new Date;

		tomorrow.setDate(tomorrow.getDate() + 1);

		account.verification.verificationTokenExpiration = tomorrow;

		account.save(() => {
			console.log('saved');
		});
	});

	// nmMailgun.sendMail({
	// 	from: 'OneNightWerewolf <admin@onenightwerewolf.online>',
	// 	to: 'blindstealer@gmail.com',
	// 	subject: 'Test email subject',
	// 	'h:Reply-To': 'chris.v.ozols@gmail.com',
	// 	html: '<h1>email!</h1>'
	// }, (err, info) => {
	// 	if (err) {
	// 		console.log(err);
	// 	}
	// });
};