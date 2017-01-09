
const bugReporter = window.bugReporter || {};

(function() {
  if (window.bugReporter) {
    return;
  }

  bugReporter.getTimeStamp = function() {
    return (new Date()).getTime();
  };

  bugReporter.log = function(content) {
    if (bugReporter.debug) {
      console.log(content);
    }
  };

  bugReporter.procCatch = function(err) {
    const data = {
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
    bugReporter.sendData(data);
  };

  bugReporter.wrap = function(fn) {
    if (!fn.__wrapped__) {
      fn.__wrapped__ = function() {
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

  bugReporter.invoke = bugReporter.wrap(function(obj, method, args) {
    return obj[method].apply(this, args);
  });

  const createXMLHTTPObject = function() {
    let xmlhttp = false;
    const XMLHttpFactories = [
      function() {
        return new XMLHttpRequest();
      },
      function() {
        return new ActiveXObject('Msxml2.XMLHTTP');
      },
      function() {
        return new ActiveXObject('Msxml3.XMLHTTP');
      },
      function() {
        return new ActiveXObject('Microsoft.XMLHTTP');
      }
    ];

    for (let i = 0, len = XMLHttpFactories.length; i < len; i++) {
      try {
        xmlhttp = XMLHttpFactories[i]();
      } catch (e) {
        continue;
      }
      break;
    }

    return xmlhttp;
  };

  const formatParams = function(params, prefix) {
    let str = [];
    for (let p in params) {
      if (Object.prototype.hasOwnProperty.call(params, p)) {
        const k = prefix ? `${prefix}[${p}]` : p;
        const v = params[p];
        str.push((typeof v === 'object')
          ? formatParams(v, k)
          : (encodeURIComponent(k) + '=' + encodeURIComponent(v))
        );
      }
    }
    return str.join('&');
  };

  bugReporter.report = function(method, url, data, cbSucs, cbFail) {
    const req = createXMLHTTPObject();
    if (!req) {
      return cbFail && cbFail(req);
    }

    method = method.toUpperCase();
    if (method === 'GET') {
      url = `${url}?${formatParams(data)}&_t=${bugReporter.getTimeStamp()}`;
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

    req.onreadystatechange = function() {
      if (req.readyState === 4) {
        if ((req.status >= 200) && (req.status < 300)) {
          cbSucs && cbSucs(req.responseText);
        } else {
          cbFail && cbFail(req);
        }
      }
    };

    req.send(data);
  };

  const copyProps = function(data, name) {
    const len = bugReporter[name].length;
    if (!len || len < 1) {
      return;
    }
    const dst = data[name] = {};
    for (let i = 0; i < len; i++) {
      dst[
        bugReporter[name][i]
      ] = (name === 'window') ? window[
        bugReporter[name][i]
      ] : window[name][
        bugReporter[name][i]
      ];
    }
  };

  bugReporter.sendData = function(data) {
    if (!data.time) {
      data['time'] = bugReporter.getTimeStamp();
    }

    copyProps(data, 'window');
    // if (bugReporter.window.length) {
    //   data.window = {};
    // }
    // for(let i = 0, wLen = bugReporter.window.length; i < wLen; i++) {
    //   data.window[
    //     bugReporter.window[i]
    //   ] = window[
    //     bugReporter.window[i]
    //   ];
    // }

    copyProps(data, 'navigator');
    // if (bugReporter.navigator.length) {
    //   data.navigator = {};
    // }
    // for(let j = 0, nLen = bugReporter.navigator.length; j < nLen; j++) {
    //   data.navigator[
    //     bugReporter.navigator[j]
    //   ] = window.navigator[
    //     bugReporter.navigator[j]
    //   ];
    // }

    copyProps(data, 'screen');
    // if (bugReporter.screen.length) {
    //   data.screen = {};
    // }
    // for(let k = 0, sLen = bugReporter.screen.length; k < sLen; k++) {
    //   data.screen[
    //     bugReporter.screen[k]
    //   ] = window.screen[
    //     bugReporter.screen[k]
    //   ];
    // }

    if (bugReporter.sdk.ins) {
      bugReporter.sdk.save(data);
    }

    if (bugReporter.url) {
      bugReporter.report(bugReporter.type, bugReporter.url,
        data,
        bugReporter.success,
        bugReporter.fail
      );
    }

    bugReporter.log(data);
  };

  const procError = function(msg, url, line, col, err) {
    // 没有URL不上报！上报也不知道错误
    if ((msg.toLowerCase().indexOf('script error') > -1) || !url) {
      return !bugReporter.output;
    }

    setTimeout(function() {
      let stack = null;
      if (!!err && (!!err.stack || !!err.stacktrace)) {
        //如果浏览器有堆栈信息 直接使用
        stack = (err.stack || err.stacktrace).toString();
      } else if (!!arguments.callee) { //尝试通过callee拿堆栈信息
        let ext = [];
        let f = arguments.callee.caller;
        let c = 3; //这里只拿三层堆栈信息
        while (f && (--c > 0)) {
          ext.push(f.toString());
          if (f === f.caller) {
            break; //如果有环
          }
          f = f.caller;
        }
        stack = ext.join(',');
      }

      bugReporter.sendData({
        msg, url, line,
        col: col || (window.event && window.event.errorCharacter) || 0,
        err, stack
      });
    }, 0);

    // 让浏览器不输出错误信息到控制台
    return !bugReporter.output;
  };

  bugReporter.injectSDK = function(cb) {
    const av = document.createElement('script');
    av.setAttribute('type', 'text/javascript');
    av.async = true;
    av.charset = 'utf-8';
    if (av.readyState) {
      av.onreadystatechange = function() {
        if (av.readyState === 'loaded' || av.readyState === 'complete') {
          av.onreadystatechange = null;
          cb && cb(av);
        }
      };
    } else {
      av.onload = function() {
        av.onload = null;
        cb && cb(av);
      };
    }
    av.onerror = function() {};
    av.src = `${bugReporter.sdk.url}?_t=${(new Date()).getTime()}`;
    const s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(av, s);

    bugReporter.uninjectSDK = function() {
      av.parentNode.removeChild(av);
    };
  };

  bugReporter.initSDK = function(appId, appKey, appClass) {
    bugReporter.injectSDK(function(dom) {
      setTimeout(function() {
        bugReporter.sdk.ins = bugReporter.sdk.init(appId, appKey, appClass);
      }, 0);
    });
  };

  bugReporter.sdk = {
    ins: null,
    url: '//cdn1.lncld.net/static/js/av-min-1.5.3.js',
    init: function(appId, appKey, appClass) {
      if (window.AV && window.AV.init) {
        window.AV.init({
          appId, appKey
        });
        return window.AV.Object.extend(appClass);
      }
    },
    save: function(data) {
      const lc = new bugReporter.sdk.ins();
      lc.save(data)
        .then(function(obj) {
          bugReporter.log(obj);
        }).catch(function(err) {
          bugReporter.log(err);
        }
      );
    }
  };

  bugReporter.init = function(opts) {
    if (!opts || (!opts.url && !opts.appId && !opts.appKey && !opts.appClass)) {
      return;
    }

    bugReporter.appId = opts.appId;
    bugReporter.appKey = opts.appKey;
    bugReporter.appClass = opts.appClass;

    bugReporter.debug = opts.debug || false;
    bugReporter.output = opts.output || false;

    bugReporter.url = opts.url;
    bugReporter.type = opts.type || 'GET';
    bugReporter.success = opts.success || function(text) {};
    bugReporter.fail = opts.fail || function(req) {};

    bugReporter.window = opts.window || [];
    bugReporter.navigator = opts.navigator || [
      'language', 'platform', 'userAgent'
    ];
    bugReporter.screen = opts.screen || ['width', 'height'];

    window.onerror = procError;

    if (bugReporter.appId && bugReporter.appKey && bugReporter.appClass) {
      bugReporter.initSDK(
        bugReporter.appId,
        bugReporter.appKey,
        bugReporter.appClass
      );
    }
  };

  bugReporter.destory = function() {
    window.onerror = null;
    if (bugReporter.sdk.ins) {
      bugReporter.uninjectSDK();
    }
  };
})();

export default bugReporter;
