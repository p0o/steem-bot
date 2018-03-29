'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _steem = require('steem');

var _steem2 = _interopRequireDefault(_steem);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _constants = require('./constants');

var _responder = require('./responder');

var _responder2 = _interopRequireDefault(_responder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SteemBotCore = function () {
  function SteemBotCore(_ref) {
    var username = _ref.username,
        postingKey = _ref.postingKey,
        activeKey = _ref.activeKey,
        config = _ref.config,
        node = _ref.node;

    _classCallCheck(this, SteemBotCore);

    this.username = username;
    this.postingKey = postingKey;
    this.activeKey = activeKey;
    this.config = config;
    this.node = node;
  }

  _createClass(SteemBotCore, [{
    key: 'handlePostOperation',
    value: function handlePostOperation(op) {
      if (this.config.post && typeof this.config.post.handler === 'function') {
        var _config$post = this.config.post,
            targets = _config$post.targets,
            handler = _config$post.handler;

        var responder = new _responder2.default({
          targetUsername: op.author,
          targetPermlink: op.permlink,
          responderUsername: this.username,
          postingKey: this.postingKey,
          activeKey: this.activeKey
        });

        if (typeof targets === 'string' && targets === _constants.ALL_USERS) {
          handler(op, responder);
        } else if (targets.includes(op.author)) {
          handler(op, responder);
        }
      }
    }
  }, {
    key: 'handleCommentOperation',
    value: function handleCommentOperation(op) {
      if (this.config.comment && typeof this.config.comment.handler === 'function') {
        var _config$comment = this.config.comment,
            targets = _config$comment.targets,
            handler = _config$comment.handler;

        var responder = new _responder2.default({
          targetUsername: op.author,
          targetPermlink: op.permlink,
          responderUsername: this.username,
          postingKey: this.postingKey,
          activeKey: this.activeKey
        });

        if (typeof targets === 'string' && targets === _constants.ALL_USERS) {
          handler(op, responder);
        } else if (targets.includes(op.author)) {
          handler(op, responder);
        }
      }
    }
  }, {
    key: 'handleTransferOperation',
    value: function handleTransferOperation(op) {
      if (this.config.deposit && typeof this.config.deposit.handler === 'function') {
        var _config$deposit = this.config.deposit,
            targets = _config$deposit.targets,
            handler = _config$deposit.handler;

        var responder = new _responder2.default({
          targetUsername: op.from,
          targetPermlink: '',
          responderUsername: this.username,
          postingKey: this.postingKey,
          activeKey: this.activeKey,
          transferMemo: op.memo
        });

        if (typeof targets === 'string' && targets === _constants.ALL_USERS) {
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

  }, {
    key: 'resetOperations',
    value: function resetOperations() {
      var _this = this;

      setTimeout(function () {
        _this.init();
      }, 5000);
    }
  }, {
    key: 'init',
    value: function init() {
      var _this2 = this;

      if (this.node) {
        _steem2.default.api.setOptions({ url: this.node });
      }

      return new _bluebird2.default(function (resolve, reject) {
        _steem2.default.api.streamOperations(function (err, res) {
          if (err) {
            console.log('Something went wrong with streamOperations method of Steem-js');
            console.log('Attempting to reset the connection...');
            _this2.resetOperations();
            return reject(err);
          }

          var opType = res[0];
          var op = res[1];

          switch (opType) {
            case 'comment':
              // Both posts and comments are known as 'comment' in this API, so we recognize them by checking the
              // value of parent_author
              if (op.parent_author === '') {
                _this2.handlePostOperation(op);
              } else {
                _this2.handleCommentOperation(op);
              }
              break;
            case 'transfer':
              _this2.handleTransferOperation(op);
              break;
          }
          resolve();
        });
      });
    }
  }]);

  return SteemBotCore;
}();

exports.default = SteemBotCore;