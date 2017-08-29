# SteemBot
SteemBot provides real-time automation on top of [Steem blockchain](https://steem.io/) with a very simple API. You can use it to quickly bootstrap an automated task with Steem without having much understanding about the node's mechanism and tricky API.

This library is basically an abstraction on top of the official JavaScript library of Steem, called [Steem-js](https://github.com/steemit/steem-js) which is somehow a low-level API and is not easy to be used for newcomers of the platform.

## Installation

NPM package is available. You should be fine to use it with any supported node-js version but feel free to report any issue:

```shell
npm install steem-bot --save
```

Then include the package on top of your file:

```javascript
const SteemBot = require('steem-bot').default
// or if your environment supports import/export:
import SteemBot from 'steem-bot';
```

## How to use?

Start with defining the constructor. You should define the constructor based on the type of operations you need to perform. If you are just observing the blockchain no argument is required. But if you need to post anything you would need to define your username and private postingKey. Also you would need to define your activeKey if you need to transfer STEEM or SBD.

```javascript
// monitoring all the deposits to poloniex and bittrex accounts real-time
const targetUsers = ['poloniex', 'bittrex'];

const bot = new SteemBot();
// or with username and keys:
// const bot = new SteemBot({username, postingKey, activeKey});

bot.onDeposit(targetUsers, (data) => {
  console.log(data); // { from: 'p0o', to: 'poloniex', amount: '10 STEEM', memo: 'GbH4HgV35Ygv'}
});

// this function will start the bot and keep it open
bot.start();
```

## Examples

Here you can find some sample codes of things you can do with SteemBot.

- Depositing Steem or SBD from users [click here](https://github.com/p0o/steem-bot/blob/master/example/deposit.js)
- Auto voting on every new post from a list of users [click here](https://github.com/p0o/steem-bot/blob/master/example/voterBot.js)
- Randowhale popular bot, full implementation [click here](https://github.com/p0o/steem-bot/blob/master/example/randowhale.js)

## API

The API is very consistent and follow the same set of rules.

### Events
SteemBot constructor after declaration will provide some methods as events which you can use to trigger different behaviors for different users. The first argument of every event method is always `targetUsers` and the second one is `handler` function. If you omit `targetUsers` the first one will be `handler` function.

Events are listed below:

**onDeposit**

Used to trigger deposits. Examples:

```javascript
// getting all the deposits for user "bittrex"
bot.onDeposit('bittrex', eventHandler);

// getting all the deposits for users "bittrex" and "poloniex"
bot.onDeposit(['bittrex', 'poloniex'], eventHandler);

// getting all the deposits from all users
bot.onDeposit(eventHandler);
```
**onPost**

Used to trigger all the posts. You can use it for one user, many users or all users of the platform similar to the deposit example above.

```javascript
// getting all the posts submited by user "bittrex"
bot.onPost('bittrex', eventHandler);

// getting all the posts submitted from users "bittrex" and "poloniex"
bot.onPost(['bittrex', 'poloniex'], eventHandler);

// getting all the posts from all users
bot.onPost(eventHandler);
```

**onComment**

Used to trigger comments. You can use it for one user, many users or all users of the platform similar to the deposit example above.

```javascript
// getting all the comments submited by user "bittrex"
bot.onComment('bittrex', handler);

// getting all the comments submitted from users "bittrex" and "poloniex"
bot.onComment(['bittrex', 'poloniex'], handler);

// getting all the comments from all users
bot.onComment(handler);
```

### targetUsers

Could be simply one string with the username of a Steem account or an array of usernames. Omitting this parameter will require the event to trigger all users.

### eventHandler

The handler function (as stated above as "handler") is a function with 2 arguments. This function will be  examined for every  block (each 3 seconds) and if is triggered by your hooks will be executed with 2 parameters. Data and Responder.

#### Data

Data is the first parameter of eventHandler and is an object directly returned from blockchain's `streamOperations` API. The contents of this object is different based on the event and would provide the data regarding the block's operation related to your event.

#### Responder

Responder is the second parameter of eventHandler and is a very powerful class which will help you to directly act on your events without doing all the low-level operations. For example you can easily use Responder to comment on the data received from your event, upvote or downvote them.

You can use responder like this:

```javascript
bot.onPost(handlePost);

function handlePost(data, responder) {
  responder.upvote();
  responder.comment('Hi @%s there! I just upvoted you using SteemBot JavaScript library!', data.author);
}

bot.start();
```
This snippet will upvote on any new post on Steem and leave a comment in that particular post (better not to execute it!)

Currently Responder provide you these methods to use:

**Responder.comment(message)**
- message is a string containing your comment text. 
- Returns: bluebird standard promise

**Responder.upvote(votingPercentage)**
- votingPercentage: is a float or string to indicate the voting percentage from 0 to 100%. If omitted default is 100%.
- Returns: bluebird standard promise

**Responder.downvote(votingPercentage)**
- votingPercentage: is a float or string to indicate the flagging percentage from 0 to 100%. If omitted default is 100%.
- Returns: bluebird standard promise

**Responder.sendSbd(amount, memo)**
- amount: is a float or string to indicate the amount of SBD to be sent from your account. You need to define the activeKey to SteemBot before using this feature.
- memo: a string to be sent as memo.
- Returns: bluebird standard promise

**Responder.sendSteem(amount, memo)**
- amount: is a float or string to indicate the amount of STEEM to be sent from your account. You need to define the activeKey to SteemBot before using this feature.
- memo: a string to be sent as memo.
- Returns: bluebird standard promise

### Memo Operations:
It's a common practice for bots (like randowhale, minnowbooster etc) to use a Steemit link in memos while depositing so the bot can use the link for any purpose (sending money or commenting). However, extracting the memo and performin low-level operations to use it is a headache, so SteemBot is providing helper methods to facilitate this process.

**Responder.commentOnMemo(message)**
Works similiar to `Responder.comment` but you can use it on deposit events when users include steemit link as memo. See [randowhale example](https://github.com/p0o/steem-bot/blob/master/example/randowhale.js) for more info.

**Responder.upvoteOnMemo(votingPercentage)**
Works similiar to `Responder.upvote` but you can use it on deposit events when users include steemit link as memo. See [randowhale example](https://github.com/p0o/steem-bot/blob/master/example/randowhale.js) for more info.

**Responder.downvoteOnMemo(votingPercentage)**
Works similiar to `Responder.downvote` but you can use it on deposit events when users include steemit link as memo. See [randowhale example](https://github.com/p0o/steem-bot/blob/master/example/randowhale.js) for more info.

# Further development
This package is still under development. Feel free to use it and feedback using github issues.

# Versioning
This package is using Semantic versioning to make sure changes in API will not break your bots.


