import steem from 'steem';
import SteemBotCore from './core';

export default class SteemBot {
  constructor(username, activeKey) {
    this.username = username && username.replace(/^@/, '');
    this.activeKey = activeKey;
    this.config = {};

    if (!username) {
      throw(new Error('Define your username as the first param of SteemBot constructor'));
    }
  }

  onDeposit(handler, targets = [this.username]) {
    if (typeof(targets) === 'string') {
      targets = [targets];
    }

    this.config.deposit = {
      handler,
      targets,
    };
  }

  onPost(handler, targets = [this.username]) {
    if (typeof(targets) === 'string') {
      targets = [targets];
    }

    this.config.post = {
      handler,
      targets,
    };
  }

  onComment(handler, targets = [this.username]) {
    if (typeof(targets) === 'string') {
      targets = [targets];
    }

    this.config.comment = {
      handler,
      targets,
    };
  }

  start() {
    const loader = new SteemBotCore({
      username: this.username,
      activeKey: this.activeKey,
      config: this.config,
    });
  }
}
