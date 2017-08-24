// No need for the line below if your environment already supports ES6 with JavaScript import/export
require('babel-register');

// change the line below to:
// const SteemBot = require('steem-bot').default
// or:
// import SteemBot from 'steem-bot';
const SteemBot = require('../src/loader').default;


const username = 'Your Steem Username';
const postingKey = 'Your Posting Key Here!'; // Use environment variables instead of hardcoding to be safer

const targetUsers = ['p0o', 'ned']; // put as many users as you want in this array or omit the argument for all users
const bot = new SteemBot({username, postingKey});

bot.onComment(targetUsers, handleComment);

function handleComment(data, responder) {
  console.log('user %s commented!', data.author);
  console.log(data.body);

  responder.comment('Hi there! I just upvoted you using SteemBot JavaScript library!');
  responder.upvote(); // 100% upvote
  /*
  responder.downvote(5); // 5% downvote (flag)
  */
}

bot.start();
