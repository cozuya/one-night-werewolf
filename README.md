one-night-werewolf
======================

A multiuser web game of deception and deduction.

![Screenshot](http://i.imgur.com/B1rRHbY.png)

Front end: React, Redux, Sass, SemanticUI, jQuery, SocketIO.

Back end: Node, Express, Pug, Passport, Mongodb with Mongoose, SocketIO.

Build: Gulp, Browserify, Babel (front end).

Latest version: 0.4.2.  Open beta began June 15th, 2016.  https://onenightwerewolf.online

## Installation ##

Install node v6.x.

Install mongodb, have it in your path.

> git clone https://github.com/cozuya/one-night-werewolf.git

> cd one-night-werewolf

> mkdir data logs

> npm i -g gulp nodemon

> npm i

At this point you may receive an error regarding node-sass so you'll need to do

> npm rebuild node-sass

For installation on windows, you may need to do a few extra steps if you are getting node-gyp errors, specifically installing the required MS programs referred to on node-gyp's github, and then possibly doing:

> set GYP_MSVS_VERSION=2013

> npm i --msvs_version=2013

instead of the npm install found above.

On occasion semantic-ui itself will attempt to install for some reason - you can safely control-c at the prompt.

## Running in dev mode ##

start mongo:

> npm run db

start server:

> npm start

build assets (first time only):

> gulp build

start development task runner:

> gulp

navigate to: http://localhost:8080

You'll most likely need a browser extension such as Chrome's Multilogin to have multiple sessions on the same browser.  No, incognito will not work.

Server side code for the game is contained in routes/socket and code quality is decent.  Code quality of the express and front end ajax stuff is sloppy.. don't judge me too harshly - that wasn't the fun part so bogging through it with some not so DRY code was an easy way to get it done.

## Tests ##

> npm test