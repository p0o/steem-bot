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

export default class Responder {
  constructor(targetUsername, targetPermlink, responderUsername, postingKey, activeKey) {
    this.targetUsername = targetUsername;
    this.targetPermlink = targetPermlink;
    this.responderUsername = responderUsername;
    this.postingKey = postingKey;
    this.activeKey = activeKey;
  }

  sendSteem(amount, memo) {
  
  }

  sendSbd(amount, memo) {

  }

  comment(message) {
    // early exits
    if (!this.permlink) {
      throw(
        new Error(
          'You cannot send a comment to a responder comming from a deposit. There is no address to send a comment to!'
        )
      );
    }

    if (!this.postingKey || !this.activeKey) {
      throw(
        new Error('You need to introduce a postingKey or activeKey to SteemBot\'s constructor')
      );
    }

    // TODO: send a comment with steemjs
    
  }

  upvote()

  downvote()
}
