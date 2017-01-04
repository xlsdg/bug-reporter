# bug-reporter
A simple javascript bug reporter


## Installation

``` bash
$ npm install --save bug-reporter
```


## Usage

使用 LeanCloud 或 自备后台服务器接口 (可同时一起使用)保存 Bug 信息。

``` html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <script src="/path/to/bugReporter.min.js"></script>
    <script type="text/javascript">
      window.bugReporter.init({
        url: '/bug/reporter',
        type: 'post',
        success: function(text) {
          console.log(text)
        },
        fail: function(req) {
          console.error(req);
        }
      });
    </script>
  </head>
  <body>
  </body>
  </html>
```


## Options

* `appId` **[String]**

  LeanCloud App ID

* `appKey` **[String]**

  LeanCloud App Key

* `appClass` **[String]**

  LeanCloud Data Class

* `debug` **[Boolean]**

  `false` by defualt.

* `output` **[Boolean]**

  `false` by defualt.

* `url` **[String]**
* `type` **[String]**

  `GET` by defualt.

* `success` **[Function]**
* `fail` **[Function]**

* `window` **[Array]**

  `[]` by defualt.

* `navigator` **[Array]**

  `['language', 'platform', 'userAgent']` by defualt.

* `screen` **[Array]**

  `['width', 'height']` by defualt.


## Methods

* `init`

``` js
  @param    {Object} opts bugReporter options
```

* `destory`
* `report`

``` js
  @param    {String} method - 'GET' or 'POST' or 'JSON'
  @param    {String} url
  @param    {Object} data
  @param    {Function} cbSucs - success callback
  @param    {Function} cbFail - fail callback
```

* `wrap` **[A generic wrapper utility function]**

``` js
  @param    {Function} fn
```

* `invoke` **[which calls a function on an object with an array of arguments]**

``` js
  @param    {Object} obj
  @param    {Function} method
  @param    {Array} args
```

# License

MIT
