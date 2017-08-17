import steem from 'steem';

class SteemBotCore {
  constructor({username, activeKey, config}) {
    this.username = username;
    this.activeKey = activeKey;
    this.config = config;
    this.init();
  }

  handleVoteOperation(op) {
    if (this.config.vote && typeof(this.config.vote.handler) === 'function') {
      const { targets } = this.config.deposit;

      if (targets.includes(op.voter)) {
        this.config.voteHandler(op);
      }
    }
  }

  handlePostOperation(op) {
    if (this.config.post && typeof(this.config.post.handler) === 'function') {
      const { targets } = this.config.post;

      if (targets.includes(op.author)) {
        this.config.commentHandler(op);
      }
    }
  }

  handleCommentOperation(op) {
    if (this.config.comment && typeof(this.config.comment.handler) === 'function') {
      const { targets } = this.config.comment;
      
      if (targets.includes(op.author)) {
        this.config.commentHandler(op);
      }
  }

  handleTransferOperation(op) {
    if (this.config.deposit && typeof(this.config.deposit.handler) === 'function') {
      const { targets } = this.config.deposit;
      
      if (targets.includes(op.to)) {
        this.config.depositHandler(op);
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
        case 'vote':
          this.handleVoteOperation(op);
          break;
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
