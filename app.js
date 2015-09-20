'use strict';

let fs = require('fs'),
	logFile = fs.createWriteStream('./logs/express.log', {flags: 'a'}),
	express = require('express'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	favicon = require('serve-favicon'),
	session = require('express-session')({
		secret: 'hunter2',
		resave: false,
		saveUninitialized: false
	}),
	socketSession = require('express-socket.io-session'),
	passport = require('passport'),
	mongoose = require('mongoose'),
	LocalStrategy = require('passport-local').Strategy,
	Account = require('./models/account'),
	routes;

app.set('views', `${__dirname}/views`);
app.set('view engine', 'jade');
app.locals.pretty = true;

app.use(logger('combined', {stream: logFile}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(favicon(`${__dirname}/public/favicon.ico`));
app.use(cookieParser());
app.use(express.static(`${__dirname}/public`));
// app.use((req, res, next) => {
// 	let err = new Error('Not Found');
// 	err.status = 404;
// 	next(err);
// });
// app.use((err, req, res, next) => {
// 	res.status(err.status || 500);
// 	res.render('error', {
// 		message: err.message,
// 		error: err
// 	});
// });

app.use(session);

io.use(socketSession(session, {
	autoSave: true
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

mongoose.connect('mongodb://localhost/chatroom-app');

require('./routes/index')();