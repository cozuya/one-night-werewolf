one-night-werewolf
======================

A multiuser web game of deception and deduction.

Front end: React, Redux, Sass, SemanticUI, SocketIO.

Back end: Node, Express, Jade, Passport, Mongodb with Mongoose, SocketIO.

Build: Gulp, Browserify, Babel (front end).

Latest version: 0.1.0.  Application works at a MVP level but is not quite ready for production deployment. Estimated alpha deployment: June 2016.  See docs/roadmap.txt.

## Installation ##

Install node - currently works with v5.x and higher.

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

Also, if you receive an error with semantic on install despite the above, you can probably fix it by:

> npm i semantic-ui

go through the prompts, then

> cd public/semantic

> gulp build

## Running in dev mode ##

start mongo:

> mongod --dbpath ./data

start server:

> nodemon bin/dev

start development task runner:

> gulp

Changing the "devStatus" object to "prod" (if its not already) in /routes/socket/util.js is probably the place to start.