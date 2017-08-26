import steem from 'steem';
import { version as steemBotVersion } from '../package.json';

/**
 * This function is extracted from condenser source code and does the same tasks with some slight-
 * adjustments to meet our needs. Refer to the main one in case of future problems:
 * https://github.com/steemit/condenser/blob/edac65e307bffc23f763ed91cebcb4499223b356/app/redux/TransactionSaga.js#L340
 *
 */
function createCommentPermlink(parentAuthor, parentPermlink, postingKey, activeKey) {
  let permlink;

  // comments: re-parentauthor-parentpermlink-time
  const timeStr = new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '');
  const newParentPermlink = parentPermlink.replace(/(-\d{8}t\d{9}z)/g, '');
  permlink = `re-${parentAuthor}-${newParentPermlink}-${timeStr}`;

  if (permlink.length > 255) {
    // STEEMIT_MAX_PERMLINK_LENGTH
    permlink = permlink.substring(permlink.length - 255, permlink.length);
  }
  // only letters numbers and dashes shall survive
  permlink = permlink.toLowerCase().replace(/[^a-z0-9-]+/g, '');
  return permlink;
}

function getContent(author, permlink) {
  return steem.api.getContentAsync(author, permlink);
}

function convert2VotingWeight(votingPercentage) {
  return Math.min(votingPercentage.toFixed(2) * 100, 10000);
}

export default class Responder {
  constructor(targetUsername, targetPermlink, responderUsername, postingKey, activeKey) {
    this.targetUsername = targetUsername;
    this.targetPermlink = targetPermlink;
    this.responderUsername = responderUsername;
    this.postingKey = postingKey;
    this.activeKey = activeKey;
  }

  _throwErrorIfNoKey() {
    if (!(this.postingKey || this.activeKey)) {
      throw(
        new Error('You need to introduce a postingKey or activeKey to SteemBot\'s constructor')
      );
    }
  }

  _throwErrorIfNoActiveKey() {
    if (!(this.activeKey)) {
      throw(
        new Error('You need to introduce an activeKey to SteemBot\'s constructor')
      );
    }
  }

  _throwErrorIfNoPermlink() {
    if (!this.targetPermlink) {
      throw(
        new Error(
          'You cannot send a comment to a responder comming from a deposit. There is no address to send a comment to!'
        )
      );
    }
  }

  sendSteem(amount, memo = '') {
    this._throwErrorIfNoActiveKey();

    const from = this.responderUsername;
    const to = this.targetUsername;
    amount = `${parseFloat(amount).toFixed(3)} STEEM`;

    return steem.broadcast.transferAsync(
      this.activeKey,
      from,
      to,
      amount,
      memo
    );
  }

  sendSbd(amount, memo) {
    this._throwErrorIfNoActiveKey();

    const from = this.responderUsername;
    const to = this.targetUsername;
    amount = `${parseFloat(amount).toFixed(3)} SBD`;

    return steem.broadcast.transferAsync(
      this.activeKey,
      from,
      to,
      amount,
      memo
    );
  }

  comment(message) {
    // early exits
    this._throwErrorIfNoPermlink();
    this._throwErrorIfNoKey();

    const permlink = createCommentPermlink(this.targetUsername, this.targetPermlink);
    const wif = this.postingKey || this.activeKey;
    const jsonMetadata = JSON.stringify({
      app: `steembot/${steemBotVersion}`,
    });

    return steem.broadcast.commentAsync(
      wif,
      this.targetUsername,
      this.targetPermlink,
      this.responderUsername,
      permlink,
      '',
      message,
      jsonMetadata,
    );
  }

  upvote(votingPercentage = 100.0) {
    this._throwErrorIfNoKey();

    if (typeof(votingPercentage) === 'string') {
      votingPercentage = parseFloat(votingPercentage);
    }

    if (votingPercentage < 0) {
      throw(new Error(`Don't use negative numbers on upvote() method. Use downvote() instead.`));
    }

    const votingWeight = convert2VotingWeight(votingPercentage);
    const wif = this.postingKey || this.activeKey;

    return steem.broadcast.voteAsync(
      wif,
      this.responderUsername,
      this.targetUsername,
      this.targetPermlink,
      votingWeight
    );
  }

  downvote(votingPercentage = 100.0) {
    this._throwErrorIfNoKey();

    if (typeof(votingPercentage) === 'string') {
      votingPercentage = parseFloat(votingPercentage);
    }

    if (votingPercentage < 0) {
      throw(
        new Error(
          `Don't use negative numbers on downvote() method. The vote will be negative from this API anyway.`
        )
      );
    }

    const votingWeight = convert2VotingWeight(votingPercentage) * -1;
    const wif = this.postingKey || this.activeKey;

    return steem.broadcast.voteAsync(
      wif,
      this.responderUsername,
      this.targetUsername,
      this.targetPermlink,
      votingWeight,
    );
  }
}
