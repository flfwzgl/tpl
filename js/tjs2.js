/**
* created by flf
*/

;(function (factory) {
  if(typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    window.tjs = factory();
  }
})(function () {
  function _encodeHTML (html) {
    return String(html)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/`/g, '&#96;')
      .replace(/'/g, '&#39;')
      .replace(/"/g, '&quot;')
  }
  
  function _escape (str) {
    return String(str).replace(/"/g, '\\"').replace(/\n/g, '\\n');  // 对 ", \n 转义
  }

  return function transform (str, opt) {
    str = str || '';
    opt = opt || {};

    var open = opt.open || '<%'
      , close = opt.close || '%>'
      , openLen = open.length
      , closeLen = close.length
      , len = str.length
    
    var i = 0, j = 0, res = '', isJs = false, ch;

    while (j <= len) {
      if (!isJs) {
        // html
        if (str.indexOf(open, j) === j || j === len) {
          res += '\n_res += "' + _escape(str.substring(i, j)) + '";\n';
          i = j += openLen;
          isJs = true;
          continue;
        }
      } else {
        // js
        if (str.substring(j, j + 2) === '//') {
          j = str.indexOf('\n', j);
          j = ~j ? j + 1 : len;
          continue;
        }

        if (str.substring(j, j + 2) === '/*') {
          j = str.indexOf('*/', j + 2);
          j = ~j ? j + 2 : len;
          continue;
        }

        if (str.charAt(j) === '/') {
          while (~(j = str.indexOf('/', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          j = ~j ? j + 1 : len;
          continue;
        }

        if (str.charAt(j) === '\'') {
          while (~(j = str.indexOf('\'', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          j = ~j ? j + 1 : len;
          continue;
        }

        if (str.charAt(j) === '"') {
          while (~(j = str.indexOf('"', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          j = ~j ? j + 1 : len;
          continue;
        }

        if (str.charAt(j) === '`') {
          while (~(j = str.indexOf('`', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
          j = ~j ? j + 1 : len;
          continue;
        }

        if (str.indexOf(close, j) === j || j === len) {
          ch = str.charAt(i);
          if (ch === '=') {
            res += '_res += _encodeHTML(' + str.substring(i + 1, j).trim() + ');\n';
          } else if (ch === '-') {
            res += '_res += ' + str.substring(i + 1, j).trim() + ';\n';
          } else {
            res += str.substring(i, j) + '\n';
          }

          i = j += closeLen;
          isJs = false;
          continue;
        }
      }
      j++;
    }

    res = 'var _res = "";\nwith(data || {}) {\n' + res.replace(/\n/g, '\n\t') + '\n}\nreturn _res;';

    var body = new Function('data', '_encodeHTML', res);
    var fn = function (data) {
      return body(data, _encodeHTML);
    }

    return fn.body = body, fn;
  }

});