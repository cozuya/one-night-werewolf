'use strict';

import fs from 'fs';
import express from 'express';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import favicon from 'serve-favicon';
import socketSession from 'express-socket.io-session'
import passport from 'passport';
import mongoose from 'mongoose';
import { Strategy } from 'passport-local';
import Account from './models/account';
import routesIndex from './routes/index';

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

mongoose.connect('mongodb://localhost/chatroom-app');

routesIndex();