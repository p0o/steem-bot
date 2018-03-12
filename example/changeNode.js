// No need for the line below if your environment already supports ES6 with JavaScript import/export
require('babel-register');

// change the line below to:
// const SteemBot = require('steem-bot').default
// or:
// import SteemBot from 'steem-bot';
const SteemBot = require('../src/loader').default;

const username = 'Your steem username';
const postingKey = 'Your Posting Key'; // Use environment variables instead of hardcoding to be safer

// just pass in argument node to the constructor
const node = 'https://api.steemit.com';
const bot = new SteemBot({username, postingKey, node});

bot.onComment(handleComment);

function handleComment(data, responder) {
  console.log('user %s commented!', data.author);
}

bot.start();
