one-night-werewolf
======================

A multiuser web game of deception and deduction.

![Screenshot](http://i.imgur.com/da9LDq6.png)

Front end: React, Redux, Sass, SemanticUI (jQuery), SocketIO.

Back end: Node, Express, Pug, Passport, Mongodb with Mongoose, SocketIO.

Build: Gulp, Browserify, Babel (front end).

Latest version: 0.2.0.  Application works at a MVP level but is not quite ready for production deployment. Estimated alpha deployment: June 2016.  See docs/roadmap.txt.

## Installation ##

Install node v5.x.  Has not been tested on Node v6.

Install mongodb, have it in your path.

> git clone https://github.com/cozuya/one-night-werewolf.git

> cd one-night-werewolf

> mkdir data logs

> npm i -g gulp nodemon

> npm i

For installation on windows, you may need to do a few extra steps if you are getting node-gyp errors, specifically installing the required MS programs referred to on node-gyp's github, and then possibly doing:

> set GYP_MSVS_VERSION=2013

> npm i --msvs_version=2013

instead of the npm install found above.

## Running in dev mode ##

start mongo:

> mongod --dbpath data

start server:

> nodemon bin/dev

start development task runner:

> gulp

navigate to:

http://localhost:8080

You'll most likely need a browser extension such as Chrome's Multilogin to have multiple sessions on the same browser.  No, incognito will not work.