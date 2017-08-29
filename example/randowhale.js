/**
 * This is an example of the popular auto voting bot in Steem called randowhale
 * This bot will upvote a random vote to anyone who send it 2 STEEM or SBD, the random vote weights
 * between 1% to 5% and it will send back the money if the user sent less or didn't put a correct
 * link in memo of transaction. 
 * 
 * Feel free to send me a fat tip in Steemit if you found it useful ;-)
 * https://steemit.com/@p0o
 */

// change the line below to include the library from npm package:
// const SteemBot = require('steem-bot').default
// or:
// import SteemBot from 'steem-bot';
const SteemBot = require('../dist/loader').default;

const username = 'Your Steem Username';
// we only use active key here since we need to transfer back the money
// using postingKey for posting comment is not necessary since if it's not available steem-bot automatically pick activeKey
const activeKey = 'Your Private Active Key'; // Use environment variables instead of hardcoding to be safer

// helper function to identify if memo has a valid steemit link 
function isValidSteemitLink(link) {
  return link.indexOf('steemit.com') > -1;
}

const bot = new SteemBot({username, activeKey});

bot.onDeposit(username, handleDeposit);

function handleDeposit(data, responder) {
  // Only vote if user sent equal or more than 2 Steem or SBD and has a valid Steemit link in memo
  if (parseFloat(data.amount) >= 0.01 &&  isValidSteemitLink(data.memo)) {
    // generate a float number between 1 and 5
    const randomVote = (Math.random() * 4).toFixed(2) + 1;

    responder.upvoteOnMemo(randomVote)
      .then(() => {
        responder.commentOnMemo(
          `This post received a ${randomVote}% upvote from @randowhale thanks to @${data.from}! For more information, click here!`
        );
      });
  } else {
    // We are good people. Just send back the money if is less than 2 or doesn't have the right memo.
    if (data.amount.indexOf('STEEM') > -1) {
      responder.sendSteem(
        data.amount,
        'Sending back the money, should be at least 2 STEEM or SBD with a valid steemit link in memo'
      );
    } else {
      responder.sendSbd(
        data.amount,
        'Sending back the money, should be at least 2 STEEM or SBD with a valid steemit link in memo'
      );
    }
  }
}

bot.start();
