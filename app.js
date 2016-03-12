'use strict';

let fs = require('fs'),
	express = require('express'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	favicon = require('serve-favicon'),
	socketSession = require('express-socket.io-session'),
	passport = require('passport'),
	mongoose = require('mongoose'),
	Strategy = require('passport-local').Strategy,
	Account = require('./models/account'),
	routesIndex = require('./routes/index');

let session = require('express-session')({
		secret: 'hunter2',
		resave: false,
		saveUninitialized: false
	}),
	logFile = fs.createWriteStream('./logs/express.log', {flags: 'a'}),
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

app.use(session);

io.use(socketSession(session, {
	autoSave: true
}));

app.use(passport.initialize());
app.use(passport.session());
// app.use(passport.authenticate('remember-me'));
passport.use(new Strategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

mongoose.connect('mongodb://localhost/one-night-werewolf-app');

routesIndex();