one-night-werewolf
======================

A multiuser web game of deception and deduction.

Front end: React, Flux (Alt), Sass, SocketIO, SemanticUI.

Back end: Node with Express, Jade, Passport, Mongodb with Mongoose, SocketIO.

Build: Gulp, Browserify, Babel.

WIP and just getting started!  Estimated alpha deployment: May 2016.

## Installation ##

Install node or iojs, currently has dependencies that don't work with iojs v3.0.0 and higher.

Install mongodb, have it in your path.

> git clone https://github.com/cozuya/one-night-werewolf.git

> cd one-night-werewolf

> mkdir data

> mkdir logs

> npm install -g gulp nodemon

> npm install

First 3 prompts from semantic use the default, then point semantic to be installed at public/semantic (instead of /semantic as default).

> cd public/semantic

> gulp build

## Running in dev mode ##

start mongo:

> mongod --dbpath ./data

start server:

> nodemon --exec npm run babel-node -- ./bin/dev

start development task runner:

> gulp