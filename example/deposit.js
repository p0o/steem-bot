// No need for the line below if your environment already supports ES6 with JavaScript import/export
require('babel-register');

// change the line below to:
// const SteemBot = require('steem-bot').default
// or:
// import SteemBot from 'steem-bot';
const SteemBot = require('../src/loader').default;


const username = 'Your Steem Username';
const postingKey = 'Your Posting Key Here!'; // Use environment variables instead of hardcoding to be safer

const targetUsers = ['randowhale', 'poloniex', 'bittrex'];
const bot = new SteemBot({username, postingKey});

bot.onDeposit(targetUsers, handleDeposit);

function handleDeposit(data, responder) {
  console.log('recevied %s deposit from %s to %s!', data.amount, data.from, data.to);
  console.log(data.memo);
  // you get the money now give your service to user
}

bot.start();
