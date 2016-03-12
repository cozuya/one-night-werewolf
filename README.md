one-night-werewolf
======================

A multiuser web game of deception and deduction.

Front end: React, Redux, Sass, SocketIO, SemanticUI.

Back end: Node with Express, Jade, Passport, Mongodb with Mongoose, SocketIO.

Build: Gulp, Browserify, Babel.

Work in progress. Estimated alpha deployment: May 2016.

## Installation ##

Install node - currently works with v5.x and below.

Install mongodb, have it in your path.

> git clone https://github.com/cozuya/one-night-werewolf.git

> cd one-night-werewolf

> mkdir data logs

> npm install -g gulp nodemon

> npm install

First 3 prompts from semantic use the default, then point semantic to be installed at public/semantic (instead of /semantic as default).

> cd public/semantic

> gulp build

For installation on windows, you may need to do a few extra steps if you are getting node-gyp errors, specifically installing the required MS programs referred to on node-gyp's github, and then possibly doing:

> set GYP_MSVS_VERSION=2013

> npm install --msvs_version=2013

instead of the npm install found above.

Also, if you receive an error with semantic on install despite the above, you can probably fix it by:

> npm install semantic-ui

go through the prompts, then

> cd public/semantic

> gulp build

## Running in dev mode ##

start mongo:

> mongod --dbpath ./data

start server:

> nodemon ./bin/dev

start development task runner:

> gulp

Changing the "devStatus" object to "prod" in util.js is probably the place to start.

## Deployment ##

start mongo:

> mongod --dbpath ./data --fork --logpath .data/mongodb.log