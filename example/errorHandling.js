// No need for the line below if your environment already supports ES6 with JavaScript import/export
require('babel-register');

// change the line below to:
// const SteemBot = require('steem-bot').default
// or:
// import SteemBot from 'steem-bot';
const SteemBot = require('../src/loader').default;


const username = 'Your steem username';
const postingKey = 'Your Posting Key'; // Use environment variables instead of hardcoding to be safer

const targetUsers = []; // put as many users as you want in this array or omit the argument for all users
const bot = new SteemBot({username, postingKey});

bot.onComment(handleComment);

function handleComment(data, responder) {
  console.log('user %s commented!', data.author);
  //console.log(data.body);
  responder.comment('Whatse whatse whats up!').catch((err) => {
    console.log('Some error happened while posting comment');
    // maybe retry commenting?
    //responder.comment('Whatsssss up Bitkonnnect');
  });
}

// you can catch errors regarding node failure here
bot.start().catch((err) => {
  console.log('Oops, node failed!');
  console.log(err);
  // no need to start it again manually, a re-try attempt will happens every 5s
});
