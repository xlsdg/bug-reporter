(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("bugReporter", [], factory);
	else if(typeof exports === 'object')
		exports["bugReporter"] = factory();
	else
		root["bugReporter"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var bugReporter = window.bugReporter || {};
	
	(function () {
	  if (window.bugReporter) {
	    return;
	  }
	
	  bugReporter.getTimeStamp = function () {
	    return new Date().getTime();
	  };
	
	  bugReporter.log = function (content) {
	    if (bugReporter.debug) {
	      console.log(content);
	    }
	  };
	
	  bugReporter.procCatch = function (err) {
	    var data = {
	      time: bugReporter.getTimeStamp(),
	      msg: err.message,
	      url: window.location.href,
	      line: err.lineNumber,
	      col: err.columnNumber,
	      err: {
	        name: err.name,
	        number: err.number,
	        description: err.description,
	        file: err.fileName
	      },
	      stack: err.stack
	    };
	    procData(data);
	  };
	
	  bugReporter.wrap = function (fn) {
	    if (!fn.__wrapped__) {
	      fn.__wrapped__ = function () {
	        try {
	          return fn.apply(this, arguments);
	        } catch (err) {
	          bugReporter.procCatch(err);
	          throw err;
	        }
	      };
	    }
	    return fn.__wrapped__;
	  };
	
	  bugReporter.invoke = bugReporter.wrap(function (obj, method, args) {
	    return obj[method].apply(this, args);
	  });
	
	  var createXMLHTTPObject = function createXMLHTTPObject() {
	    var xmlhttp = false;
	    var XMLHttpFactories = [function () {
	      return new XMLHttpRequest();
	    }, function () {
	      return new ActiveXObject('Msxml2.XMLHTTP');
	    }, function () {
	      return new ActiveXObject('Msxml3.XMLHTTP');
	    }, function () {
	      return new ActiveXObject('Microsoft.XMLHTTP');
	    }];
	
	    for (var i = 0, len = XMLHttpFactories.length; i < len; i++) {
	      try {
	        xmlhttp = XMLHttpFactories[i]();
	      } catch (e) {
	        continue;
	      }
	      break;
	    }
	
	    return xmlhttp;
	  };
	
	  var formatParams = function formatParams(params, prefix) {
	    var str = [];
	    for (var p in params) {
	      if (Object.prototype.hasOwnProperty.call(params, p)) {
	        var k = prefix ? prefix + '[' + p + ']' : p;
	        var v = params[p];
	        str.push((typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object' ? formatParams(v, k) : encodeURIComponent(k) + '=' + encodeURIComponent(v));
	      }
	    }
	    return str.join('&');
	  };
	
	  bugReporter.report = function (method, url, data, cbSucs, cbFail) {
	    var req = createXMLHTTPObject();
	    if (!req) {
	      return cbFail && cbFail(req);
	    }
	
	    method = method.toUpperCase();
	    if (method === 'GET') {
	      url = url + '?' + formatParams(data) + '&_t=' + bugReporter.getTimeStamp();
	      data = null;
	    }
	
	    req.open(method, url, true);
	    if (method === 'POST') {
	      req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	    } else if (method === 'JSON') {
	      req.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
	    }
	
	    if (data) {
	      data = JSON.stringify(data);
	    }
	
	    req.onreadystatechange = function () {
	      if (req.readyState === 4) {
	        if (req.status >= 200 && req.status < 300) {
	          cbSucs && cbSucs(req.responseText);
	        } else {
	          cbFail && cbFail(req);
	        }
	      }
	    };
	
	    req.send(data);
	  };
	
	  var procData = function procData(data) {
	    if (bugReporter.window.length) {
	      data.window = {};
	    }
	    for (var i = 0, wLen = bugReporter.window.length; i < wLen; i++) {
	      data.window[bugReporter.window[i]] = window[bugReporter.window[i]];
	    }
	
	    if (bugReporter.navigator.length) {
	      data.navigator = {};
	    }
	    for (var j = 0, nLen = bugReporter.navigator.length; j < nLen; j++) {
	      data.navigator[bugReporter.navigator[j]] = window.navigator[bugReporter.navigator[j]];
	    }
	
	    if (bugReporter.screen.length) {
	      data.screen = {};
	    }
	    for (var k = 0, sLen = bugReporter.screen.length; k < sLen; k++) {
	      data.screen[bugReporter.screen[k]] = window.screen[bugReporter.screen[k]];
	    }
	
	    if (bugReporter.sdk.ins) {
	      bugReporter.sdk.save(data);
	    }
	
	    if (bugReporter.url) {
	      bugReporter.report(bugReporter.type, bugReporter.url, data, bugReporter.success, bugReporter.fail);
	    }
	
	    bugReporter.log(data);
	  };
	
	  var procError = function procError(msg, url, line, col, err) {
	    // 没有URL不上报！上报也不知道错误
	    if (msg.toLowerCase().indexOf('script error') > -1 || !url) {
	      return !bugReporter.output;
	    }
	
	    setTimeout(function () {
	      var stack = null;
	      if (!!err && (!!err.stack || !!err.stacktrace)) {
	        //如果浏览器有堆栈信息 直接使用
	        stack = (err.stack || err.stacktrace).toString();
	      } else if (!!arguments.callee) {
	        //尝试通过callee拿堆栈信息
	        var ext = [];
	        var f = arguments.callee.caller;
	        var c = 3; //这里只拿三层堆栈信息
	        while (f && --c > 0) {
	          ext.push(f.toString());
	          if (f === f.caller) {
	            break; //如果有环
	          }
	          f = f.caller;
	        }
	        stack = ext.join(',');
	      }
	
	      procData({
	        time: bugReporter.getTimeStamp(),
	        msg: msg, url: url, line: line,
	        col: col || window.event && window.event.errorCharacter || 0,
	        err: err, stack: stack
	      });
	    }, 0);
	
	    // 让浏览器不输出错误信息到控制台
	    return !bugReporter.output;
	  };
	
	  bugReporter.injectSDK = function (cb) {
	    var av = document.createElement('script');
	    av.setAttribute('type', 'text/javascript');
	    av.async = true;
	    av.charset = 'UTF-8';
	    if (av.readyState) {
	      av.onreadystatechange = function () {
	        if (av.readyState === 'loaded' || av.readyState === 'complete') {
	          av.onreadystatechange = null;
	          cb && cb();
	        }
	      };
	    } else {
	      av.onload = function () {
	        av.onload = null;
	        cb && cb();
	      };
	    }
	    av.src = bugReporter.sdk.url + '?_t=' + new Date().getTime();
	    var s = document.getElementsByTagName('script')[0];
	    s.parentNode.insertBefore(av, s);
	
	    bugReporter.uninjectSDK = function () {
	      av.parentNode.removeChild(av);
	    };
	  };
	
	  bugReporter.initSDK = function (appId, appKey, appClass) {
	    bugReporter.injectSDK(function () {
	      setTimeout(function () {
	        bugReporter.sdk.ins = bugReporter.sdk.init(appId, appKey, appClass);
	      }, 0);
	    });
	  };
	
	  bugReporter.sdk = {
	    ins: null,
	    url: '//cdn1.lncld.net/static/js/av-min-1.5.3.js',
	    init: function init(appId, appKey, appClass) {
	      if (window.AV && window.AV.init) {
	        window.AV.init({
	          appId: appId, appKey: appKey
	        });
	        return window.AV.Object.extend(appClass);
	      }
	    },
	    save: function save(data) {
	      var lc = new bugReporter.sdk.ins();
	      lc.save(data).then(function (obj) {
	        bugReporter.log(obj);
	      }).catch(function (err) {
	        bugReporter.log(err);
	      });
	    }
	  };
	
	  bugReporter.init = function (opts) {
	    if (!opts || !opts.url && !opts.appId && !opts.appKey && !opts.appClass) {
	      return;
	    }
	
	    bugReporter.appId = opts.appId;
	    bugReporter.appKey = opts.appKey;
	    bugReporter.appClass = opts.appClass;
	
	    bugReporter.debug = opts.debug || false;
	    bugReporter.output = opts.output || false;
	
	    bugReporter.url = opts.url;
	    bugReporter.type = opts.type || 'GET';
	    bugReporter.success = opts.success || function (text) {};
	    bugReporter.fail = opts.fail || function (req) {};
	
	    bugReporter.window = opts.window || [];
	    bugReporter.navigator = opts.navigator || ['language', 'platform', 'userAgent'];
	    bugReporter.screen = opts.screen || ['width', 'height'];
	
	    window.onerror = procError;
	
	    if (bugReporter.appId && bugReporter.appKey && bugReporter.appClass) {
	      bugReporter.initSDK(bugReporter.appId, bugReporter.appKey, bugReporter.appClass);
	    }
	  };
	
	  bugReporter.destory = function () {
	    window.onerror = null;
	    if (bugReporter.sdk.ins) {
	      bugReporter.uninjectSDK();
	    }
	  };
	})();
	
	exports.default = bugReporter;
	module.exports = exports['default'];

/***/ }
/******/ ])
});
;
//# sourceMappingURL=bugReporter.js.map