// No need for the line below if your environment already supports ES6 with JavaScript import/export
require('babel-register');

// change the line below to:
// const SteemBot = require('steem-bot').default
// or:
// import SteemBot from 'steem-bot';
const SteemBot = require('steem-bot').default;


const username = 'paragon99';
const postingKey = '5JmTLvTcsjoCUFMUbcBoZ3u4rgc8xJCed9rPj4ucHqDExjBBkjs'; // Use environment variables instead of hardcoding to be safer

const targetUsers = []; // put as many users as you want in this array or omit the argument for all users
const bot = new SteemBot({paragon99, 5JmTLvTcsjoCUFMUbcBoZ3u4rgc8xJCed9rPj4ucHqDExjBBkjs});

bot.onComment(targetUsers, handleComment);

function handleComment(data, responder) {
  console.log('user %s commented!', data.author);
  console.log(data.body);

  responder.comment('You called us and we responded');
  responder.upvote(); // 100% upvote
  /*
  responder.downvote(5); // 5% downvote (flag)
  */
}

bot.start();
