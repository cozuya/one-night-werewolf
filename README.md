one-night-werewolf
======================

A multiuser web game of deception and deduction.

Front end: React, Redux, Sass, SemanticUI, SocketIO.

Back end: Node, Express, Pug, Passport, Mongodb with Mongoose, SocketIO.

Build: Gulp, Browserify, Babel (front end).

Latest version: 0.1.0.  Application works at a MVP level but is not quite ready for production deployment. Estimated alpha deployment: June 2016.  See docs/roadmap.txt.

## Installation ##

Install node v5.x.  Does not yet work on node v6 at least on windows where most of the dev is done.

Install mongodb, have it in your path.

> git clone https://github.com/cozuya/one-night-werewolf.git

> cd one-night-werewolf

> mkdir data logs

> npm i -g gulp nodemon

> npm i

First 3 prompts from semantic use the default, then point semantic to be installed at public/semantic (instead of /semantic as default).

> cd public/semantic

> gulp build

For installation on windows, you may need to do a few extra steps if you are getting node-gyp errors, specifically installing the required MS programs referred to on node-gyp's github, and then possibly doing:

> set GYP_MSVS_VERSION=2013

> npm i --msvs_version=2013

instead of the npm install found above.

## Running in dev mode ##

start mongo:

> mongod --dbpath ./data

start server:

> nodemon bin/dev

start development task runner:

> gulp

Changing the "devStatus" object to "prod" (if its not already) in /routes/socket/util.js is probably the place to start.