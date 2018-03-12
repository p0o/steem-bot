import steem from 'steem';
import Promise from 'bluebird';
import { ALL_USERS } from './constants';
import Responder from './responder';

class SteemBotCore {
  constructor({username, postingKey, activeKey, config, node}) {
    this.username = username;
    this.postingKey = postingKey;
    this.activeKey = activeKey;
    this.config = config;
    this.node = node;
  }

  handlePostOperation(op) {
    if (this.config.post && typeof(this.config.post.handler) === 'function') {
      const { targets, handler } = this.config.post;
      const responder = new Responder({
        targetUsername: op.author,
        targetPermlink: op.permlink,
        responderUsername: this.username,
        postingKey: this.postingKey,
        activeKey: this.activeKey,
      });

      if (typeof(targets) === 'string' && targets === ALL_USERS) {
        handler(op, responder);
      } else if (targets.includes(op.author)) {
        handler(op, responder);
      }
    }
  }

  handleCommentOperation(op) {
    if (this.config.comment && typeof(this.config.comment.handler) === 'function') {
      const { targets, handler } = this.config.comment;
      const responder = new Responder({
        targetUsername: op.author,
        targetPermlink: op.permlink,
        responderUsername: this.username,
        postingKey: this.postingKey,
        activeKey: this.activeKey,
      });

      if (typeof(targets) === 'string' && targets === ALL_USERS) {
        handler(op, responder);
      } else if (targets.includes(op.author)) {
        handler(op, responder);
      }
    }
  }

  handleTransferOperation(op) {
    if (this.config.deposit && typeof(this.config.deposit.handler) === 'function') {
      const { targets, handler } = this.config.deposit;
      const responder = new Responder({
        targetUsername: op.from,
        targetPermlink: '',
        responderUsername: this.username,
        postingKey: this.postingKey,
        activeKey: this.activeKey,
        transferMemo: op.memo,
      });

      if (typeof(targets) === 'string' && targets === ALL_USERS) {
        handler(op, responder);
      } else if (targets.includes(op.to)) {
        handler(op, responder);
      }
    }
  }

  /**
   * Resetting the streamOperations automatically after 5s
   * Expected scenario is when a node is failing
   */
  resetOperations() {
    setTimeout(() => {
      this.init();
    }, 5000);
  }

  init() {
    if (this.node) {
      steem.api.setOptions({ url: this.node });
    }

    return new Promise((resolve, reject) => {
      steem.api.streamOperations((err, res) => {
        if (err) {
          console.log('Something went wrong with streamOperations method of Steem-js');
          console.log('Attempting to reset the connection...');
          this.resetOperations();
          return reject(err);
        }

        const opType = res[0];
        const op = res[1];

        switch(opType) {
          case 'comment':
            // Both posts and comments are known as 'comment' in this API, so we recognize them by checking the
            // value of parent_author
            if (op.parent_author === '') {
              this.handlePostOperation(op);
            } else {
              this.handleCommentOperation(op);
            }
            break;
          case 'transfer':
            this.handleTransferOperation(op);
            break;
        }
        resolve();
      });
    });
  }
}

export default SteemBotCore;
