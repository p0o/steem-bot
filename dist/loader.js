'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _steem = require('steem');

var _steem2 = _interopRequireDefault(_steem);

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getConfig(args) {
  var targets = void 0;
  var handler = void 0;

  if (args.length > 2) {
    throw new Error('Your event function should only have one or two arguments');
  }

  if (typeof args[0] === 'function') {
    // user omitted targets param
    targets = _constants.ALL_USERS;
    handler = args[0];
  } else {
    targets = typeof args[0] === 'string' ? [args[0]] : args[0];
    handler = args[1];
  }

  return {
    handler: handler,
    targets: targets
  };
}

var SteemBot = function () {
  function SteemBot(_ref) {
    var username = _ref.username,
        postingKey = _ref.postingKey,
        activeKey = _ref.activeKey;

    _classCallCheck(this, SteemBot);

    this.username = username && username.replace(/^@/, '');
    this.postingKey = postingKey;
    this.activeKey = activeKey;
    this.config = {};

    if (!username) {
      throw new Error('Define your username as the first param of SteemBot constructor');
    }
  }

  _createClass(SteemBot, [{
    key: 'onDeposit',
    value: function onDeposit() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this.config.deposit = getConfig(args);
    }
  }, {
    key: 'onPost',
    value: function onPost() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      this.config.post = getConfig(args);
    }
  }, {
    key: 'onComment',
    value: function onComment() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      this.config.comment = getConfig(args);
    }
  }, {
    key: 'start',
    value: function start() {
      var loader = new _core2.default({
        username: this.username,
        activeKey: this.activeKey,
        postingKey: this.postingKey,
        config: this.config
      });
    }
  }]);

  return SteemBot;
}();

exports.default = SteemBot;