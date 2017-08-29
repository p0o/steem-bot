import steem from 'steem';
import { ALL_USERS } from './constants';
import Responder from './responder';

class SteemBotCore {
  constructor({username, postingKey, activeKey, config}) {
    this.username = username;
    this.postingKey = postingKey;
    this.activeKey = activeKey;
    this.config = config;
    this.init();
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

  init() {
    steem.api.streamOperations((err, res) => {
      if (err) {
        throw(new Error('Something went wrong with streamOperations method of Steem-js'));
        console.log(err);
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
    });
  }
}

export default SteemBotCore;
