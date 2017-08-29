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
  return Math.min(Math.floor(votingPercentage.toFixed(2) * 100), 10000);
}

function isValidSteemitLink(link) {
  return link.match(/^https?:\/\/(www\.)?steemit\.com\//i);
}

/**
 * Should input a full steemit article link and return the username of the author
 * @param {string} steemitLink 
 */
function extractUsernameFromLink(steemitLink) {
  if (isValidSteemitLink(steemitLink)) {
    const usernamePos = steemitLink.search(/\/@.+\//);
    if (usernamePos === -1) return;

    const firstPart = steemitLink.slice(usernamePos + 2); // adding 2 to remove "/@"
    return firstPart.slice(0, firstPart.search('/'));
  }
}

/**
 * Should input a full steemit article link and return the permlink of the article
 * @param {string} steemitLink 
 */
function extractPermlinkFromLink(steemitLink) {
  if (isValidSteemitLink(steemitLink)) {
    const usernamePos = steemitLink.search(/\/@.+\//);
    if (usernamePos === -1) return;

    const firstPart = steemitLink.slice(usernamePos + 1); // adding 1 to remove the first "/"
    return firstPart.slice(firstPart.search('/') + 1).replace('/', '').replace('#', '');
  }
}

export default class Responder {
  constructor({targetUsername, targetPermlink, transferMemo, responderUsername, postingKey, activeKey}) {
    this.targetUsername = targetUsername;
    this.targetPermlink = targetPermlink;
    this.transferMemo = transferMemo;
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

  _throwErrorIfNoPermlink(targetPermlink) {
    if (!targetPermlink) {
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

  comment(
    message,
    targetUsername = this.targetUsername,
    targetPermlink = this.targetPermlink
  ) {
    // early exits
    this._throwErrorIfNoPermlink(targetPermlink);
    this._throwErrorIfNoKey();

    const permlink = createCommentPermlink(targetUsername, targetPermlink);
    const wif = this.postingKey || this.activeKey;
    const jsonMetadata = JSON.stringify({
      app: `steembot/${steemBotVersion}`,
    });

    return steem.broadcast.commentAsync(
      wif,
      targetUsername,
      targetPermlink,
      this.responderUsername,
      permlink,
      '',
      message,
      jsonMetadata,
    );
  }

  upvote(
    votingPercentage = 100.0,
    targetUsername = this.targetUsername,
    targetPermlink = this.targetPermlink
  ) {
    this._throwErrorIfNoKey();
    this._throwErrorIfNoPermlink(targetPermlink);

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
      targetUsername,
      targetPermlink,
      votingWeight
    );
  }

  downvote(
    votingPercentage = 100.0,
    targetUsername = this.targetUsername,
    targetPermlink = this.targetPermlink
  ) {
    this._throwErrorIfNoKey();
    this._throwErrorIfNoPermlink(targetPermlink);

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
      targetUsername,
      targetPermlink,
      votingWeight,
    );
  }

  upvoteOnMemo(votingPercentage = 100.0) {
    const customTargetUsername = extractUsernameFromLink(this.transferMemo);
    const customTargetPermlink = extractPermlinkFromLink(this.transferMemo);

    return this.upvote(votingPercentage, customTargetUsername, customTargetPermlink);
  }

  downvoteOnMemo(votingPercentage = 100.0) {
    const customTargetUsername = extractUsernameFromLink(this.transferMemo);
    const customTargetPermlink = extractPermlinkFromLink(this.transferMemo);

    return this.downvote(votingPercentage, customTargetUsername, customTargetPermlink);
  }

  commentOnMemo(message) {
    const customTargetUsername = extractUsernameFromLink(this.transferMemo);
    const customTargetPermlink = extractPermlinkFromLink(this.transferMemo);

    return this.comment(message, customTargetUsername, customTargetPermlink);
  }
}
