'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _steem = require('steem');

var _steem2 = _interopRequireDefault(_steem);

var _package = require('../package.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This function is extracted from condenser source code and does the same tasks with some slight-
 * adjustments to meet our needs. Refer to the main one in case of future problems:
 * https://github.com/steemit/condenser/blob/edac65e307bffc23f763ed91cebcb4499223b356/app/redux/TransactionSaga.js#L340
 *
 */
function createCommentPermlink(parentAuthor, parentPermlink, postingKey, activeKey) {
  var permlink = void 0;

  // comments: re-parentauthor-parentpermlink-time
  var timeStr = new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '');
  var newParentPermlink = parentPermlink.replace(/(-\d{8}t\d{9}z)/g, '');
  permlink = 're-' + parentAuthor + '-' + newParentPermlink + '-' + timeStr;

  if (permlink.length > 255) {
    // STEEMIT_MAX_PERMLINK_LENGTH
    permlink = permlink.substring(permlink.length - 255, permlink.length);
  }
  // only letters numbers and dashes shall survive
  permlink = permlink.toLowerCase().replace(/[^a-z0-9-]+/g, '');
  return permlink;
}

function getContent(author, permlink) {
  return _steem2.default.api.getContentAsync(author, permlink);
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
    var usernamePos = steemitLink.search(/\/@.+\//);
    if (usernamePos === -1) return;

    var firstPart = steemitLink.slice(usernamePos + 2); // adding 2 to remove "/@"
    return firstPart.slice(0, firstPart.search('/'));
  }
}

/**
 * Should input a full steemit article link and return the permlink of the article
 * @param {string} steemitLink 
 */
function extractPermlinkFromLink(steemitLink) {
  if (isValidSteemitLink(steemitLink)) {
    var usernamePos = steemitLink.search(/\/@.+\//);
    if (usernamePos === -1) return;

    var firstPart = steemitLink.slice(usernamePos + 1); // adding 1 to remove the first "/"
    return firstPart.slice(firstPart.search('/') + 1).replace('/', '').replace('#', '');
  }
}

var Responder = function () {
  function Responder(_ref) {
    var targetUsername = _ref.targetUsername,
        targetPermlink = _ref.targetPermlink,
        transferMemo = _ref.transferMemo,
        responderUsername = _ref.responderUsername,
        postingKey = _ref.postingKey,
        activeKey = _ref.activeKey;

    _classCallCheck(this, Responder);

    this.targetUsername = targetUsername;
    this.targetPermlink = targetPermlink;
    this.transferMemo = transferMemo;
    this.responderUsername = responderUsername;
    this.postingKey = postingKey;
    this.activeKey = activeKey;
  }

  _createClass(Responder, [{
    key: '_throwErrorIfNoKey',
    value: function _throwErrorIfNoKey() {
      if (!(this.postingKey || this.activeKey)) {
        throw new Error('You need to introduce a postingKey or activeKey to SteemBot\'s constructor');
      }
    }
  }, {
    key: '_throwErrorIfNoActiveKey',
    value: function _throwErrorIfNoActiveKey() {
      if (!this.activeKey) {
        throw new Error('You need to introduce an activeKey to SteemBot\'s constructor');
      }
    }
  }, {
    key: '_throwErrorIfNoPermlink',
    value: function _throwErrorIfNoPermlink(targetPermlink) {
      if (!targetPermlink) {
        throw new Error('You cannot send a comment to a responder comming from a deposit. There is no address to send a comment to!');
      }
    }
  }, {
    key: 'sendSteem',
    value: function sendSteem(amount) {
      var memo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      this._throwErrorIfNoActiveKey();

      var from = this.responderUsername;
      var to = this.targetUsername;
      amount = parseFloat(amount).toFixed(3) + ' STEEM';

      return _steem2.default.broadcast.transferAsync(this.activeKey, from, to, amount, memo);
    }
  }, {
    key: 'sendSbd',
    value: function sendSbd(amount, memo) {
      this._throwErrorIfNoActiveKey();

      var from = this.responderUsername;
      var to = this.targetUsername;
      amount = parseFloat(amount).toFixed(3) + ' SBD';

      return _steem2.default.broadcast.transferAsync(this.activeKey, from, to, amount, memo);
    }
  }, {
    key: 'comment',
    value: function comment(message) {
      var targetUsername = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.targetUsername;
      var targetPermlink = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.targetPermlink;

      // early exits
      this._throwErrorIfNoPermlink(targetPermlink);
      this._throwErrorIfNoKey();

      var permlink = createCommentPermlink(targetUsername, targetPermlink);
      var wif = this.postingKey || this.activeKey;
      var jsonMetadata = JSON.stringify({
        app: 'steembot/' + _package.version
      });

      return _steem2.default.broadcast.commentAsync(wif, targetUsername, targetPermlink, this.responderUsername, permlink, '', message, jsonMetadata);
    }
  }, {
    key: 'upvote',
    value: function upvote() {
      var votingPercentage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100.0;
      var targetUsername = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.targetUsername;
      var targetPermlink = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.targetPermlink;

      this._throwErrorIfNoKey();
      this._throwErrorIfNoPermlink(targetPermlink);

      if (typeof votingPercentage === 'string') {
        votingPercentage = parseFloat(votingPercentage);
      }

      if (votingPercentage < 0) {
        throw new Error('Don\'t use negative numbers on upvote() method. Use downvote() instead.');
      }

      var votingWeight = convert2VotingWeight(votingPercentage);
      var wif = this.postingKey || this.activeKey;

      return _steem2.default.broadcast.voteAsync(wif, this.responderUsername, targetUsername, targetPermlink, votingWeight);
    }
  }, {
    key: 'downvote',
    value: function downvote() {
      var votingPercentage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100.0;
      var targetUsername = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.targetUsername;
      var targetPermlink = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.targetPermlink;

      this._throwErrorIfNoKey();
      this._throwErrorIfNoPermlink(targetPermlink);

      if (typeof votingPercentage === 'string') {
        votingPercentage = parseFloat(votingPercentage);
      }

      if (votingPercentage < 0) {
        throw new Error('Don\'t use negative numbers on downvote() method. The vote will be negative from this API anyway.');
      }

      var votingWeight = convert2VotingWeight(votingPercentage) * -1;
      var wif = this.postingKey || this.activeKey;

      return _steem2.default.broadcast.voteAsync(wif, this.responderUsername, targetUsername, targetPermlink, votingWeight);
    }
  }, {
    key: 'upvoteOnMemo',
    value: function upvoteOnMemo() {
      var votingPercentage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100.0;

      var customTargetUsername = extractUsernameFromLink(this.transferMemo);
      var customTargetPermlink = extractPermlinkFromLink(this.transferMemo);

      return this.upvote(votingPercentage, customTargetUsername, customTargetPermlink);
    }
  }, {
    key: 'downvoteOnMemo',
    value: function downvoteOnMemo() {
      var votingPercentage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100.0;

      var customTargetUsername = extractUsernameFromLink(this.transferMemo);
      var customTargetPermlink = extractPermlinkFromLink(this.transferMemo);

      return this.downvote(votingPercentage, customTargetUsername, customTargetPermlink);
    }
  }, {
    key: 'commentOnMemo',
    value: function commentOnMemo(message) {
      var customTargetUsername = extractUsernameFromLink(this.transferMemo);
      var customTargetPermlink = extractPermlinkFromLink(this.transferMemo);

      return this.comment(message, customTargetUsername, customTargetPermlink);
    }
  }]);

  return Responder;
}();

exports.default = Responder;