import steem from 'steem';
import SteemBotCore from './core';
import { ALL_USERS } from './constants';

function getConfig(args) {
  let targets;
  let handler;

  if (args.length > 2) {
    throw(new Error('Your event function should only have one or two arguments'));
  }

  if (typeof(args[0]) === 'function') { // user omitted targets param
    targets = ALL_USERS;
    handler = args[0];
  } else {
    targets = typeof(args[0]) === 'string' ? [args[0]] : args[0];
    handler = args[1];
  }

  return {
    handler,
    targets,
  };
}

export default class SteemBot {
  constructor({username, postingKey, activeKey}) {
    this.username = username && username.replace(/^@/, '');
    this.postingKey = postingKey;
    this.activeKey = activeKey;
    this.config = {};

    if (!username) {
      throw(new Error('Define your username as the first param of SteemBot constructor'));
    }
  }

  onDeposit(...args) {
    this.config.deposit = getConfig(args);
  }

  onPost(...args) {
    this.config.post = getConfig(args);
  }

  onComment(...args) {
    this.config.comment = getConfig(args);
  }

  start() {
    const loader = new SteemBotCore({
      username: this.username,
      activeKey: this.activeKey,
      postingKey: this.postingKey,
      config: this.config,
    });
  }
}
