/**
 * Dynamsoft JavaScript Library
 * @product Dynamsoft Webcam SDK
 * @website http://www.dynamsoft.com
 *
 * @preserve Copyright 2017, Dynamsoft Corporation
 * @author Dynamsoft R&D Team
 *
 * @version 5.1
 *
 * @fileoverview Utilities for DWS internal use.
 */

var dynamsoft = dynamsoft || {};
dynamsoft.lib = dynamsoft.lib || {};
// common api
(function (lib, undefined) {
    var OP=Object.prototype,
		AP = Array.prototype,
        toString = OP.toString,
		win = window,
		nil=undefined,
		EMPTY_STR = '',
        FALSE = !1, TRUE = !0,
		_console = FALSE,
		class2TypeMap = {},
		mix, each, navInfo, isNil, types, mixIsFunctions;

    // use to add source object's api to dest object
    lib.mix = mix = function (dest, source) {
        for (var i in source) {
            dest[i] = source[i];
        }

        return dest;
    };

	isNil=function (o) {
		return o === nil;
	};
	
	isDef=function (o) {
		return o !== nil;
	};
	
    // type judgement: isDef / isUndef / isUndefined / isNull / isString / isFunction / isObject / 
    // isArray / isBoolean / isNumber / isPlainObject
    mix(lib, {
        'isDef': isDef,
        'isUndef': isNil,
        'isUndefined': isNil,

        'isNull': function (o) {
            return (o === null);
        },

        'isNaN': function (o) {
            return isNaN(o);
        },

        'type': function (o) {
            if (o === null || o === nil)
                return String(o);
            return class2TypeMap[toString.call(o)] || 'object';
        },

        // checks to see if an object is a plain object (created using '{}'
        // or 'new Object()' but not 'new FunctionClass()')
        isPlainObject: function (obj) {
            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that Dom nodes and window objects don't pass through, as well
            if (!obj || lib.type(obj) !== 'object' || obj.nodeType ||
                // jshint eqeqeq:false
                // must == for ie8
                obj.window == obj) {
                return FALSE;
            }

            var key, objConstructor;

            try {
                // Not own constructor property must be Object
                if ((objConstructor = obj.constructor)
					&& !hasOwnProperty(obj, 'constructor')
					&& !hasOwnProperty(objConstructor.prototype, 'isPrototypeOf')) {
                    return FALSE;
                }
            } catch (e) {
                // IE8,9 Will throw exceptions on certain host objects
                return FALSE;
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
            // jshint noempty:false
            for (key in obj) {
            }

            return (isNil(key) || hasOwnProperty(obj, key));
        }
    });

	mixIsFunctions = function (name, lc) {
        // populate the class2type map
        class2TypeMap['[object ' + name + ']'] = (lc = name.toLowerCase());

        // add isBoolean/isNumber/...
        lib['is' + name] = function (o) {
            return lib.type(o) === lc;
        };
    };
	
	// add isFunction
	mixIsFunctions('Function');
	
    // each
    lib.each = each = function (object, fn, context) {
        if (object) {
            var key,
                val,
                keys,
                i = 0,
                length = object.length,
                // do not use typeof obj == 'function': bug in phantomjs
                isObj = isNil(length) || lib.isFunction(object);

            context = context || null;

            if (isObj) {
                keys = lib.keys(object);
                for (; i < keys.length; i++) {
                    key = keys[i];
                    // can not use hasOwnProperty
                    if (fn.call(context, object[key], key, object) === FALSE) {
                        break;
                    }
                }
            } else {
                for (val = object[0];
                    i < length; val = object[++i]) {
                    if (fn.call(context, val, i, object) === FALSE) {
                        break;
                    }
                }
            }
        }

        return object;
    };

	types = ['String', 'Object', 'Boolean', 'Number'];
    if (Array.isArray) {
        lib.isArray = Array.isArray;
    } else {
        types.push('Array');
    }

    each(types, mixIsFunctions);



	if (!isNil(win['console'])) {
		_console=win['console'];
		if(!lib.isFunction(_console['log']) || !lib.isFunction(_console['error']))
		{
			_console=false;
		}
	}

    // log
    mix(lib, {
        'debug': FALSE,

        'log': function (txt) {
            if (lib.debug && _console) {
				_console.log(txt);
            }
        },
		'error': function(txt) {
            if (lib.debug && _console) {
				_console.error(txt);
            }
		},

        'getLogger': function () {
            var _ = lib.log;
            return { warn: _, log: _, info: _, debug: _ };
        },
		
		'nil': nil,
		'noop': function(){}
    });

    // string startsWith/endsWith/replaceAll
    mix(lib, {
        startsWith: function (str, prefix) {
            return str.lastIndexOf(prefix, 0) === 0;
        },

        endsWith: function (str, suffix) {
            var ind = str.length - suffix.length;
            return ind >= 0 && str.indexOf(suffix, ind) === ind;
        },

        replaceAll: function (str, sFind, sReplace) {
            return str.replace(eval('/' + sFind + '/gi'), sReplace);
        },

        upperCaseFirst: function(str) {
            return str.charAt(0).toUpperCase() + str.substr(1);
        },
		
		makeArray: function (o) {
            if (o == null) {
                return [];
            }
            if (lib.isArray(o)) {
                return o;
            }
            var lengthType = typeof o.length,
                oType = typeof o;
            // The strings and functions also have 'length'
            if (lengthType !== 'number' ||
                // form.elements in ie78 has nodeName 'form'
                // then caution select
                // o.nodeName
                // window
                o.alert ||
                oType === 'string' ||
                // https://github.com/ariya/phantomjs/issues/11478
                (oType === 'function' && !( 'item' in o && lengthType === 'number'))) {
                return [o];
            }
            var ret = [];
            for (var i = 0, l = o.length; i < l; i++) {
                ret[i] = o[i];
            }
            return ret;
        }
    });


    var hasEnumBug = !({ toString: 1 }.propertyIsEnumerable('toString')),
        enumProperties = [
            'constructor',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toString',
            'toLocaleString',
            'valueOf'
        ];

    // get all the property names of an array object
    lib.keys = Object.keys || function(o) {
        var result = [], p, i;

        for (p in o) {
            // lib.keys(new XX())
            if (o.hasOwnProperty(p)) {
                result.push(p);
            }
        }

        if (hasEnumBug) {
            for (i = enumProperties.length - 1; i >= 0; i--) {
                p = enumProperties[i];
                if (o.hasOwnProperty(p)) {
                    result.push(p);
                }
            }
        }

        return result;
    };


    function hasOwnProperty(o, p) {
        return OP.hasOwnProperty.call(o, p);
    }
    

    // load Script / css
    var doc = win['document'],
		docElement = doc && doc.documentElement,
		head = doc.getElementsByTagName('head')[0] || docElement,
		scriptOnload = doc.createElement('script').readyState ?
			function (node, callback) {
			    var oldCallback = node.onreadystatechange;
			    node.onreadystatechange = function () {
			        var rs = node.readyState;
			        if (rs === 'loaded' || rs === 'complete') {
			            node.onreadystatechange = null;
			            oldCallback && oldCallback();
			            callback.call(this);
			        }
			    };
			} :
			function (node, callback) {
			    node.addEventListener('load', callback, FALSE);
			    node.addEventListener('error', callback, FALSE);
			};

    // getScript
    lib.getScript = function (url, isAsync, callback) {
        var node, u;
        if (!lib.isFunction(callback)) {
            callback = function () { };
        }

        if (!lib.isString(url) || url == EMPTY_STR) {
            callback();
            return;
        }

        node = doc.createElement('script');

        u = ['', url].join(EMPTY_STR);
        node.src = u;

        if (isAsync)
            node.async = TRUE;

        node.charset = 'utf-8';

        scriptOnload(node, callback);

        head.insertBefore(node, head.firstChild);

        return node;
    };


    // getCss
    lib.getCss = function (url, callback) {
        var node, u, c=callback;
		
        if (!lib.isFunction(c)) {
            c = !1;
        }
        if (!lib.isString(url) || url == EMPTY_STR) {
            c && c();
            return;
        }

        node = doc.createElement('link');

        node.href = url;
        node.rel = 'stylesheet';
		node.async = TRUE;
		
        c && scriptOnload(node, c);

        head.insertBefore(node, head.firstChild);
        return node;
    };

    lib.getRandom = function() {
        var a = new Date().getTime() % 1e4,
            b = [],
            tmp;

        for (var i = 0; i < 5; i++) {
            tmp = Math.floor(Math.random() * 10);
            if (i == 0 && tmp == 0) {
                i = -1;
                continue;
            }
            b.push(tmp);
        }

        if (a < 10) {
            b.push('000');
        } else if (a < 100) {
            b.push('00');
        } else if (a < 1e3) {
            b.push('0');
        }
        b.push(a);

        return b.join('');
    };

    // simple DOM functions
    mix(lib, {
        get: function (id) {
            return doc.getElementById(id);
        },

        hide: function (id) {
            var o = lib.isString(id) ? lib.get(id) : id;

            if (o) {
                o.style.display = 'none';
            }
        },

        show: function (id) {
            var o = lib.isString(id) ? lib.get(id) : id;

            if (o) {
                o.style.display = EMPTY_STR;
            }
        },

        toggle: function (id) {
            var o = lib.isString(id) ? lib.get(id) : id;

            if (o) {
                if (o.style.display === 'none')
                    o.style.display = EMPTY_STR;
                else
                    o.style.display = 'none';
            }
        },

        empty: function(el) {
            if (!el) return;

            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
        },

        getOffset: function (evt, _parent, target) {
			evt = evt || window.event;
            var el = target || evt.target,
				x = 0, y = 0, parentLeft = 0, parentTop = 0,
				scrollTop, scrollLeft, bFixed = false;

            while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {

                scrollLeft = el.scrollLeft;
                scrollTop = el.scrollTop;

                if (el.tagName === 'BODY') {
                    if (bFixed) {
                        scrollLeft = 0;
                        scrollTop = 0;
                    } else {
                        scrollLeft = scrollLeft | document.documentElement.scrollLeft;
                        scrollTop = scrollTop | document.documentElement.scrollTop;
                    }
                } else {
                    if (el.style.position === 'fixed') {
                        bFixed = true;
                    }
                }

                x += el.offsetLeft - scrollLeft;
                y += el.offsetTop - scrollTop;

                el = el.offsetParent;
            }

            if (_parent) {
                parentLeft = _parent.left;
                parentTop = _parent.top;
            }

            x = evt.clientX - x - parentLeft;
            y = evt.clientY - y - parentTop;

            return { 'x': x, 'y': y };
        },

        getElDimensions: function (el, bOffset) {
            var displayFormat, elDimensions;

            if (!el) return false;

            displayFormat = el.style.display;

            el.style.display = '';
            
            elDimensions = bOffset ?
            {
                offsetTop: el.offsetTop, offsetLeft: el.offsetLeft,
                offsetWidth: el.offsetWidth, offsetHeight: el.offsetHeight
            } :
            {
                clientTop: el.clientTop, clientLeft: el.clientLeft,
                clientWidth: el.clientWidth ? el.clientWidth : (parseInt(el.style.width) ? parseInt(el.style.width) : 0),
                clientHeight: el.clientHeight ? el.clientHeight : (parseInt(el.style.height) ? parseInt(el.style.height) : 0)
            };

            el.style.display = displayFormat;

            return elDimensions;
        }
    });

    //lib.removeArrayDuplicates = function(arr) {
    //    if (!lib.isArray(arr)) return;

    //    var temp = [];
    //    arr.sort(function (a, b) {
    //        return a - b;
    //    });
    //    for (var j = 0; j < arr.length; j++) {
    //        if (arr[j + 1] !== arr[j]) {
    //            temp.push(arr[j]);
    //        }
    //    }

    //    arr = temp;
    //};						
						
    var ua = navigator.userAgent.toLowerCase(),
        _platform = navigator.platform.toLowerCase(),
        _protocol = doc.location.protocol,
        _ssl = (_protocol === 'https:'),
        _bFileSystem = (_protocol !== 'https:' && _protocol !== 'http:'),

        _bWin = (_platform == 'win32') || (_platform == 'win64') || (_platform == 'windows'),
        _bMac = (_platform == 'mac68k') || (_platform == 'macppc') || (_platform == 'macintosh') || (_platform == 'macintel') || (_platform == 'iphone'),
        _bLinux = (_platform.indexOf('linux') >= 0),
		
		
        _isX64 = (_platform == 'win64') || (ua.indexOf('WOW64') >= 0) || (ua.indexOf('x86_64') >= 0)
            || (ua.indexOf('win64') >= 0) || (ua.indexOf('x64') >= 0),

        _nMSIE = ua.indexOf('msie'),
        _nTrident = ua.indexOf('trident'),
        _nRV = ua.indexOf('rv:'),
        _nEdge = ua.indexOf('edge'),

        _tmp = ua.match(/version\/([\d.]+).*safari/),
        _bSafari = _tmp ? TRUE : FALSE,
        _nSafari = _tmp ? _tmp[1] : 0,

		_nFirefox = ua.indexOf('firefox'),
		_bFirefox = (_nFirefox != -1),
		
		_bEdge = _bWin && !_bFirefox && (_nEdge != -1),
		
		_indexOfChrome = ua.indexOf('chrome'),
		_bChrome =  !_bEdge && (_indexOfChrome != -1),

		_bIE = _bWin && !_bFirefox && !_bEdge && !_bChrome && (_nMSIE != -1 || _nTrident != -1 || _nRV != -1),
        _strIEVersion = '',
		_IEMode=0,
		
		_bGecko = ua.match(/Gecko/) ? TRUE : FALSE,

		_bHTML5Edition = FALSE,

		_strBrowserVersion = EMPTY_STR,
		_bQuerySelector = FALSE,
        _nativeJson = win['JSON'],
		guidNum = 0;

    if(_bEdge) {
		_tmp = ua.slice(_nEdge + 5);
		_tmp = _tmp.slice(0, _tmp.indexOf(' '));
		_strIEVersion = _tmp;

		_tmp = _tmp.slice(0, _tmp.indexOf('.'));
		if (_tmp >= 27) {
		    _bHTML5Edition = TRUE;
		}
	} else if (_bChrome) {
		_tmp = ua.slice(_indexOfChrome + 7);
		_tmp = _tmp.slice(0, _tmp.indexOf(' '));
		_strBrowserVersion = _tmp;

		_tmp = _tmp.slice(0, _tmp.indexOf('.'));
		if (_tmp >= 27) {
		    _bHTML5Edition = TRUE;
		}
    } else if (_bFirefox) {	// FF
        _tmp = ua.slice(_nFirefox + 8);
        _tmp = _tmp.slice(0, _tmp.indexOf(' '));
        _strBrowserVersion = _tmp;

        _tmp = _tmp.slice(0, _tmp.indexOf('.'));
        if (_tmp >= 27) {
            _bHTML5Edition = TRUE;
        }
    } else if (_bIE) {
        if (_nMSIE != -1) {
            // 'msie'
            _tmp = ua.slice(_nMSIE + 4);
            _tmp = _tmp.slice(0, _tmp.indexOf(';'));
            _strIEVersion = _tmp;
        } else if (_nRV != -1) {
            // 'rv:'
            _tmp = ua.slice(_nRV + 3);
            _tmp = _tmp.slice(0, _tmp.indexOf(';'));
            _tmp = _tmp.slice(0, _tmp.indexOf(')'));
            _strIEVersion = _tmp;
        } else if (_nTrident != -1) {
            // 'trident'
            _tmp = ua.slice(_nTrident + 7);
            _tmp = _tmp.slice(0, _tmp.indexOf(';'));
            _strIEVersion = _tmp;
        }

        if (_strIEVersion === '' || _strIEVersion > 8.0) {
                _bHTML5Edition = TRUE;
        }

        _strBrowserVersion = _tmp;

    } else if (_bSafari) {
        if (_tmp) {
            _strBrowserVersion = _tmp[1];
        }

        _tmp = _nSafari;
        _tmp = _tmp.slice(0, _tmp.indexOf('.'));

        // safari
        if (_tmp >= 7) {
            _bHTML5Edition = TRUE;
        }
    }
	
	if(_bEdge || _bIE)
	{
		// This is an IE browser. What mode is the engine in?
		if (doc.documentMode) {
			// IE8 or later
			_IEMode = doc.documentMode; 
		}
		else // IE 5-7
		{
			_IEMode = 5; // Assume quirks mode unless proven otherwise
			if (doc.compatMode)
			{
				if (doc.compatMode == "CSS1Compat")
					_IEMode = 7; // standards mode
			}
			// There is no test for IE6 standards mode because that mode  
			// was replaced by IE7 standards mode; there is no emulation.
		}
	}

    if (docElement && docElement.querySelector && (!_bIE || _bIE && (_strBrowserVersion > 8))) {
        _bQuerySelector = TRUE;
    }

    // ie 8.0.7600.16315@win7 json bug!
    if (_bIE && _strBrowserVersion < 9) {
        _nativeJson = null;
    }

    dynamsoft.navInfo = navInfo = {
        host: win,
        bSSL: _ssl,
        bFileSystem: _bFileSystem,

        bWin: _bWin,
        bMac: _bMac,
		bLinux: _bLinux,
		isX64: _isX64,

        bIE: _bIE,
        bEdge: _bEdge,
        bChrome: _bChrome,
        bFirefox: _bFirefox,
        bSafari: _bSafari,
		bGecko: _bGecko,
		
        bHTML5Edition: _bHTML5Edition,

        strBrowserVersion: _strBrowserVersion,
		IEMode: _IEMode,
        bQuerySelectorSupported: _bQuerySelector,
        nativeJson: _nativeJson,
        nodejs: FALSE,
		scrollBarWidth: false
    };


    // global functions
	var RE_TRIM = /^[\s\xa0]+|[\s\xa0]+$/g,
		trim = String.prototype.trim,
        indexOf = AP.indexOf,
        lastIndexOf = AP.lastIndexOf,
        filter = AP.filter,
        every = AP.every,
        some = AP.some,
        map = AP.map;

    mix(lib, {
        now: Date.now || function () {
            return +new Date();
        },
        guid: function (pre) {
            return (pre || EMPTY_STR) + guidNum++;
        },
		trim: trim ?
            function (str) {
                return str == null ? EMPTY_STR : trim.call(str);
            } :
            function (str) {
                return str == null ? EMPTY_STR : (str + '').replace(RE_TRIM, EMPTY_STR);
            },
		filter: filter ?
            function (arr, fn, context) {
                return filter.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var ret = [];
                each(arr, function (item, i, arr) {
                    if (fn.call(context || this, item, i, arr)) {
                        ret.push(item);
                    }
                });
                return ret;
            },
		indexOf: indexOf ?
            function (item, arr) {
                return indexOf.call(arr, item);
            } :
            function (item, arr) {
				each(arr,function(v,k){
					if(v===item)
						return k
				});
                return -1;
            }
    });


{
    // IE doesn't include non-breaking-space (0xa0) in their \s character
    // class (as required by section 7.2 of the ECMAScript spec), we explicitly
    // include it in the regexp to enforce consistent cross-browser behavior.
    var logger = lib.getLogger(),
		SEP = '&',
        EQ = '=',
        HEX_BASE = 16,
    // http://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
    // http://wonko.com/post/html-escaping
        htmlEntities = {
            '&amp;': '&',
            '&gt;': '>',
            '&lt;': '<',
            '&#x60;': '`',
            '&#x2F;': '/',
            '&quot;': '"',
            /*jshint quotmark:false*/
            '&#x27;': "'"
        },
        reverseEntities = {},
        escapeReg,
        unEscapeReg,
    // - # $ ^ * ( ) + [ ] { } | \ , . ?
        escapeRegExp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
    (function () {
        for (var k in htmlEntities) {
            reverseEntities[htmlEntities[k]] = k;
        }
    })();

    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return TRUE.
        return val == null || (t !== 'object' && t !== 'function');
    }

    function getEscapeReg() {
        if (escapeReg) {
            return escapeReg;
        }
        var str = EMPTY_STR;
        each(htmlEntities, function (entity) {
            str += entity + '|';
        });
        str = str.slice(0, -1);
        escapeReg = new RegExp(str, 'g');
        return escapeReg;
    }

    function getUnEscapeReg() {
        if (unEscapeReg) {
            return unEscapeReg;
        }
        var str = EMPTY_STR;
        each(reverseEntities, function (entity) {
            str += entity + '|';
        });
        str += '&#(\\d{1,5});';
        unEscapeReg = new RegExp(str, 'g');
        return unEscapeReg;
    }

    lib.mix(lib, {

        /**
         * Call encodeURIComponent to encode a url component
         * @param {String} s part of url to be encoded.
         * @return {String} encoded url part string.
         */
        urlEncode: function (s) {
            return encodeURIComponent(String(s));
        },

        /**
         * Call decodeURIComponent to decode a url component
         * and replace '+' with space.
         * @param {String} s part of url to be decoded.
         * @return {String} decoded url part string.
         */
        urlDecode: function (s) {
            return decodeURIComponent(s.replace(/\+/g, ' '));
        },

        /**
         * frequently used in taobao cookie about nick
         * @return {String} un-unicode string.
         */
        fromUnicode: function (str) {
            return str.replace(/\\u([a-f\d]{4})/ig, function (m, u) {
                return  String.fromCharCode(parseInt(u, HEX_BASE));
            });
        },
        /**
         * get escaped string from html.
         * only escape
         *      & > < ` / " '
         * refer:
         *
         * [http://yiminghe.javaeye.com/blog/788929](http://yiminghe.javaeye.com/blog/788929)
         *
         * [http://wonko.com/post/html-escaping](http://wonko.com/post/html-escaping)
         * @param str {string} text2html show
         * @return {String} escaped html
         */
        escapeHtml: function (str) {
            return (str + '').replace(getEscapeReg(), function (m) {
                return reverseEntities[m];
            });
        },

        /**
         * get escaped regexp string for construct regexp.
         * @param str
         * @return {String} escaped regexp
         */
        escapeRegExp: function (str) {
            return str.replace(escapeRegExp, '\\$&');
        },

        /**
         * un-escape html to string.
         * only unescape
         *      &amp; &lt; &gt; &#x60; &#x2F; &quot; &#x27; &#\d{1,5}
         * @param str {string} html2text
         * @return {String} un-escaped html
         */
        unEscapeHtml: function (str) {
            return str.replace(getUnEscapeReg(), function (m, n) {
                return htmlEntities[m] || String.fromCharCode(+n);
            });
        },
        /**
         * Creates a serialized string of an array or object.
         *
         * for example:
         *     @example
         *     {foo: 1, bar: 2}    // -> 'foo=1&bar=2'
         *     {foo: 1, bar: [2, 3]}    // -> 'foo=1&bar=2&bar=3'
         *     {foo: '', bar: 2}    // -> 'foo=&bar=2'
         *     {foo: undefined, bar: 2}    // -> 'foo=undefined&bar=2'
         *     {foo: TRUE, bar: 2}    // -> 'foo=TRUE&bar=2'
         *
         * @param {Object} o json data
         * @param {String} [sep='&'] separator between each pair of data
         * @param {String} [eq='='] separator between key and value of data
         * @param {Boolean} [serializeArray=true] whether add '[]' to array key of data
         * @return {String}
         */
        param: function (o, sep, eq, serializeArray) {
            sep = sep || SEP;
            eq = eq || EQ;
            if (isNil(serializeArray)) {
                serializeArray = TRUE;
            }
            var buf = [], key, i, v, len, val,
                encode = lib.urlEncode;
            for (key in o) {

                val = o[key];
                key = encode(key);

                // val is valid non-array value
                if (isValidParamValue(val)) {
                    buf.push(key);
                    if (isDef(val)) {
                        buf.push(eq, encode(val + EMPTY_STR));
                    }
                    buf.push(sep);
                }
                // val is not empty array
                else if (lib.isArray(val) && val.length) {
                    for (i = 0, len = val.length; i < len; ++i) {
                        v = val[i];
                        if (isValidParamValue(v)) {
                            buf.push(key, (serializeArray ? encode('[]') : EMPTY_STR));
                            if (isDef(v)) {
                                buf.push(eq, encode(v + EMPTY_STR));
                            }
                            buf.push(sep);
                        }
                    }
                }
                // ignore other cases, including empty array, Function, RegExp, Date etc.

            }
            buf.pop();
            return buf.join(EMPTY_STR);
        },

        /**
         * Parses a URI-like query string and returns an object composed of parameter/value pairs.
         *
         * for example:
         *      @example
         *      'section=blog&id=45'        // -> {section: 'blog', id: '45'}
         *      'section=blog&tag=js&tag=doc' // -> {section: 'blog', tag: ['js', 'doc']}
         *      'tag=ruby%20on%20rails'        // -> {tag: 'ruby on rails'}
         *      'id=45&raw'        // -> {id: '45', raw: ''}
         * @param {String} str param string
         * @param {String} [sep='&'] separator between each pair of data
         * @param {String} [eq='='] separator between key and value of data
         * @return {Object} json data
         */
        unparam: function (str, sep, eq) {
            if (!lib.isString(str) || !(str = lib.trim(str))) {
                return {};
            }
            sep = sep || SEP;
            eq = eq || EQ;
            var ret = {},
                eqIndex,
                decode = lib.urlDecode,
                pairs = str.split(sep),
                key, val,
                i = 0, len = pairs.length;

            for (; i < len; ++i) {
                eqIndex = lib.indexOf(eq,pairs[i]);
                if (eqIndex === -1) {
                    key = decode(pairs[i]);
                    val = nil;
                } else {
                    // remember to decode key!
                    key = decode(pairs[i].substring(0, eqIndex));
                    val = pairs[i].substring(eqIndex + 1);
                    try {
                        val = decode(val);
                    } catch (e) {
                        logger.error('decodeURIComponent error : ' + val);
                        logger.error(e);
                    }
                    if (lib.endsWith(key, '[]')) {
                        key = key.substring(0, key.length - 2);
                    }
                }
                if (key in ret) {
                    if (lib.isArray(ret[key])) {
                        ret[key].push(val);
                    } else {
                        ret[key] = [ret[key], val];
                    }
                } else {
                    ret[key] = val;
                }
            }
            return ret;
        }
    });

}
/*
 Refer
 - https://github.com/joyent/node/blob/master/lib/path.js
 */
{
    // [root, dir, basename, ext]
    var splitPathRe = /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;


    // Remove .. and . in path array
    function normalizeArray(parts, allowAboveRoot) {
        // level above root
        var up = 0,
            i = parts.length - 1,
        // splice costs a lot in ie
        // use new array instead
            newParts = [],
            last;

        for (; i >= 0; i--) {
            last = parts[i];
            if (last !== '.') {
                if (last === '..') {
                    up++;
                } else if (up) {
                    up--;
                } else {
                    newParts[newParts.length] = last;
                }
            }
        }

        // if allow above root, has to add ..
        if (allowAboveRoot) {
            for (; up--; up) {
                newParts[newParts.length] = '..';
            }
        }

        newParts = newParts.reverse();

        return newParts;
    }

    /**
     * Path Utils.
     * @singleton
     */
    var Path = lib.Path = {
        /**
         * resolve([from ...], to)
         * @return {String} Resolved path.
         */
        resolve: function () {
            var resolvedPath = '',
                resolvedPathStr,
                i,
                args = (arguments),
                path,
                absolute = 0;

            for (i = args.length - 1; i >= 0 && !absolute; i--) {
                path = args[i];
				// path is not empty string
                if (lib.isString(path) && !!path) {
					resolvedPath = path + '/' + resolvedPath;
					absolute = path.charAt(0) === '/';
                }
            }

            resolvedPathStr = normalizeArray(lib.filter(resolvedPath.split('/'), function (p) {
                return !!p;
            }), !absolute).join('/');

            return ((absolute ? '/' : '') + resolvedPathStr) || '.';
        },

        /**
         * normalize .. and . in path
         * @param {String} path Path tobe normalized
         *
         *
         *      'x/y/../z' => 'x/z'
         *      'x/y/z/../' => 'x/y/'
         *
         * @return {String}
         */
        normalize: function (path) {
            var absolute = path.charAt(0) === '/',
                trailingSlash = path.slice(-1) === '/';

            path = normalizeArray(lib.filter(path.split('/'), function (p) {
                return !!p;
            }), !absolute).join('/');

            if (!path && !absolute) {
                path = '.';
            }

            if (path && trailingSlash) {
                path += '/';
            }


            return (absolute ? '/' : '') + path;
        },

        /**
         * join([path ...]) and normalize
         * @return {String}
         */
        join: function () {
            var args = lib.makeArray(arguments);
            return Path.normalize(lib.filter(args,function (p) {
                return p && (lib.isString(p));
            }).join('/'));
        },

        /**
         * Get string which is to relative to from
         * @param {String} from
         * @param {String} to
         *
         *
         *      relative('x/','x/y/z') => 'y/z'
         *      relative('x/t/z','x/') => '../../'
         *
         * @return {String}
         */
        relative: function (from, to) {
            from = Path.normalize(from);
            to = Path.normalize(to);

            var fromParts = lib.filter(from.split('/'), function (p) {
                    return !!p;
                }),
                path = [],
                sameIndex,
                sameIndex2,
                toParts = lib.filter(to.split('/'), function (p) {
                    return !!p;
                }), commonLength = Math.min(fromParts.length, toParts.length);

            for (sameIndex = 0; sameIndex < commonLength; sameIndex++) {
                if (fromParts[sameIndex] !== toParts[sameIndex]) {
                    break;
                }
            }

            sameIndex2 = sameIndex;

            while (sameIndex < fromParts.length) {
                path.push('..');
                sameIndex++;
            }

            path = path.concat(toParts.slice(sameIndex2));

            path = path.join('/');

            return /**@type String  @ignore*/path;
        },

        /**
         * Get base name of path
         * @param {String} path
         * @param {String} [ext] ext to be stripped from result returned.
         * @return {String}
         */
        basename: function (path, ext) {
            var result = path.match(splitPathRe) || [],
                basename;
            basename = result[3] || '';
            if (ext && basename && basename.slice(-1 * ext.length) === ext) {
                basename = basename.slice(0, -1 * ext.length);
            }
            return basename;
        },

        /**
         * Get dirname of path
         * @param {String} path
         * @return {String}
         */
        dirname: function (path) {
            var result = path.match(splitPathRe) || [],
                root = result[1] || '',
                dir = result[2] || '';

            if (!root && !dir) {
                // No dirname
                return '.';
            }

            if (dir) {
                // It has a dirname, strip trailing slash
                dir = dir.substring(0, dir.length - 1);
            }

            return root + dir;
        },

        /**
         * Get extension name of file in path
         * @param {String} path
         * @return {String}
         */
        extname: function (path) {
            return (path.match(splitPathRe) || [])[4] || '';
        }
    };
}
{
    var logger = lib.getLogger(),
		reDisallowedInSchemeOrUserInfo = /[#\/\?@]/g,
        reDisallowedInPathName = /[#\?]/g,

        reDisallowedInQuery = /[#@]/g,
        reDisallowedInFragment = /#/g,

        URI_SPLIT_REG = new RegExp(
            '^' +
                /*
                 Scheme names consist of a sequence of characters beginning with a
                 letter and followed by any combination of letters, digits, plus
                 ('+'), period ('.'), or hyphen ('-').
                 */
                '(?:([\\w\\d+.-]+):)?' + // scheme

                '(?://' +
                /*
                 The authority component is preceded by a double slash ('//') and is
                 terminated by the next slash ('/'), question mark ('?'), or number
                 sign ('#') character, or by the end of the URI.
                 */
                '(?:([^/?#@]*)@)?' + // userInfo

                '(' +
                '[\\w\\d\\-\\u0100-\\uffff.+%]*' +
                '|' +
                // ipv6
                '\\[[^\\]]+\\]' +
                ')' + // hostname - restrict to letters,
                // digits, dashes, dots, percent
                // escapes, and unicode characters.
                '(?::([0-9]+))?' + // port
                ')?' +
                /*
                 The path is terminated
                 by the first question mark ('?') or number sign ('#') character, or
                 by the end of the URI.
                 */
                '([^?#]+)?' + // path. hierarchical part
                /*
                 The query component is indicated by the first question
                 mark ('?') character and terminated by a number sign ('#') character
                 or by the end of the URI.
                 */
                '(?:\\?([^#]*))?' + // query. non-hierarchical data
                /*
                 The fragment identifier component of a URI allows indirect
                 identification of a secondary resource by reference to a primary
                 resource and additional identifying information.

                 A
                 fragment identifier component is indicated by the presence of a
                 number sign ('#') character and terminated by the end of the URI.
                 */
                '(?:#(.*))?' + // fragment
                '$'),

        Path = lib.Path,

        REG_INFO = {
            scheme: 1,
            userInfo: 2,
            hostname: 3,
            port: 4,
            path: 5,
            query: 6,
            fragment: 7
        };

    function parseQuery(self) {
        if (!self._queryMap) {
            self._queryMap = lib.unparam(self._query);
        }
    }

    /**
     * @class Uri.Query
     * Query data structure.
     * @param {String} [query] encoded query string(without question mask).
     */
    function Query(query) {
        this._query = query || '';
    }

    Query.prototype = {
        constructor: Query,

        /**
         * Cloned new instance.
         * @return {Uri.Query}
         */
        clone: function () {
            return new Query(this.toString());
        },


        /**
         * reset to a new query string
         * @param {String} query
         * @chainable
         */
        reset: function (query) {
            var self = this;
            self._query = query || '';
            self._queryMap = null;
            return self;
        },

        /**
         * Parameter count.
         * @return {Number}
         */
        count: function () {
            var self = this,
                count = 0,
                _queryMap,
                k;
            parseQuery(self);
            _queryMap = self._queryMap;
            for (k in _queryMap) {

                if (lib.isArray(_queryMap[k])) {
                    count += _queryMap[k].length;
                } else {
                    count++;
                }

            }
            return count;
        },

        /**
         * judge whether has query parameter
         * @param {String} [key]
         */
        has: function (key) {
            var self = this, _queryMap;
            parseQuery(self);
            _queryMap = self._queryMap;
            if (key) {
                return key in _queryMap;
            } else {
                return !lib.isEmptyObject(_queryMap);
            }
        },

        /**
         * Return parameter value corresponding to current key
         * @param {String} [key]
         */
        get: function (key) {
            var self = this, _queryMap;
            parseQuery(self);
            _queryMap = self._queryMap;
            if (key) {
                return _queryMap[key];
            } else {
                return _queryMap;
            }
        },

        /**
         * Parameter names.
         * @return {String[]}
         */
        keys: function () {
            var self = this;
            parseQuery(self);
            return lib.keys(self._queryMap);
        },

        /**
         * Set parameter value corresponding to current key
         * @param {String} key
         * @param value
         * @chainable
         */
        set: function (key, value) {
            var self = this, _queryMap;
            parseQuery(self);
            _queryMap = self._queryMap;
            if (lib.isString(key)) {
                self._queryMap[key] = value;
            } else {
                if (key instanceof Query) {
                    key = key.get();
                }
                each(key, function (v, k) {
                    _queryMap[k] = v;
                });
            }
            return self;
        },

        /**
         * Remove parameter with specified name.
         * @param {String} key
         * @chainable
         */
        remove: function (key) {
            var self = this;
            parseQuery(self);
            if (key) {
                delete self._queryMap[key];
            } else {
                self._queryMap = {};
            }
            return self;

        },

        /**
         * Add parameter value corresponding to current key
         * @param {String} key
         * @param value
         * @chainable
         */
        add: function (key, value) {
            var self = this,
                _queryMap,
                currentValue;
            if (lib.isString(key)) {
                parseQuery(self);
                _queryMap = self._queryMap;
                currentValue = _queryMap[key];
                if (isNil(currentValue)) {
                    currentValue = value;
                } else {
                    currentValue = [].concat(currentValue).concat(value);
                }
                _queryMap[key] = currentValue;
            } else {
                if (key instanceof Query) {
                    key = key.get();
                }
                for (var k in key) {
                    self.add(k, key[k]);
                }
            }
            return self;
        },

        /**
         * Serialize query to string.
         * @param {Boolean} [serializeArray=true]
         * whether append [] to key name when value 's type is array
         */
        toString: function (serializeArray) {
            var self = this;
            parseQuery(self);
            return lib.param(self._queryMap, nil, nil, serializeArray);
        }
    };

    function padding2(str) {
        return str.length === 1 ? '0' + str : str;
    }

    function equalsIgnoreCase(str1, str2) {
        return str1.toLowerCase() === str2.toLowerCase();
    }

    // www.ta#bao.com // => www.ta.com/#bao.com
    // www.ta%23bao.com
    // Percent-Encoding
    function encodeSpecialChars(str, specialCharsReg) {
        // encodeURI( ) is intended to encode complete URIs,
        // the following ASCII punctuation characters,
        // which have special meaning in URIs, are not escaped either:
        // ; / ? : @ & = + $ , #
        return encodeURI(str).replace(specialCharsReg, function (m) {
            return '%' + padding2(m.charCodeAt(0).toString(16));
        });
    }

    /**
     * @class Uri
     * Most of its interfaces are same with window.location.
     * @param {String|Uri} [uriStr] Encoded uri string.
     */
    function Uri(uriStr) {

        if (uriStr instanceof  Uri) {
            return uriStr.clone();
        }

        var components, self = this;

        lib.mix(self,
            {
                /**
                 * scheme such as 'http:'. aka protocol without colon
                 * @type {String}
                 */
                scheme: '',
                /**
                 * User credentials such as 'yiminghe:gmail'
                 * @type {String}
                 */
                userInfo: '',
                /**
                 * hostname such as 'docs.kissyui.com'. aka domain
                 * @type {String}
                 */
                hostname: '',
                /**
                 * Port such as '8080'
                 * @type {String}
                 */
                port: '',
                /**
                 * path such as '/index.htm'. aka pathname
                 * @type {String}
                 */
                path: '',
                /**
                 * Query object for search string. aka search
                 * @type {Uri.Query}
                 */
                query: '',
                /**
                 * fragment such as '#!/test/2'. aka hash
                 */
                fragment: ''
            });

        components = Uri.getComponents(uriStr);

        each(components, function (v, key) {
            v = v || '';
            if (key === 'query') {
                // need encoded content
                self.query = new Query(v);
            } else {
                // https://github.com/kissyteam/kissy/issues/298
                try {
                    v = lib.urlDecode(v);
                } catch (e) {
                    logger.error(e + 'urlDecode error : ' + v);
                }
                // need to decode to get data structure in memory
                self[key] = v;
            }
        });

        return self;
    }

    Uri.prototype = {
        constructor: Uri,

        /**
         * Return a cloned new instance.
         * @return {Uri}
         */
        clone: function () {
            var uri = new Uri(), self = this;
            each(REG_INFO, function (index, key) {
                uri[key] = self[key];
            });
            uri.query = uri.query.clone();
            return uri;
        },


        /**
         * The reference resolution algorithm.rfc 5.2
         * return a resolved uri corresponding to current uri
         * @param {Uri|String} relativeUri
         *
         * for example:
         *      @example
         *      this: 'http://y/yy/z.com?t=1#v=2'
         *      'https:/y/' => 'https:/y/'
         *      '//foo' => 'http://foo'
         *      'foo' => 'http://y/yy/foo'
         *      '/foo' => 'http://y/foo'
         *      '?foo' => 'http://y/yy/z.com?foo'
         *      '#foo' => http://y/yy/z.com?t=1#foo'
         *
         * @return {Uri}
         */
        resolve: function (relativeUri) {

            if (lib.isString(relativeUri)) {
                relativeUri = new Uri(relativeUri);
            }

            var self = this,
                override = 0,
                lastSlashIndex,
                order = ['scheme', 'userInfo', 'hostname', 'port', 'path', 'query', 'fragment'],
                target = self.clone();

            each(order, function (o) {
                if (o === 'path') {
                    // relativeUri does not set for scheme/userInfo/hostname/port
                    if (override) {
                        target[o] = relativeUri[o];
                    } else {
                        var path = relativeUri.path;
                        if (path) {
                            // force to override target 's query with relative
                            override = 1;
                            if (!lib.startsWith(path, '/')) {
                                if (target.hostname && !target.path) {
                                    // RFC 3986, section 5.2.3, case 1
                                    path = '/' + path;
                                } else if (target.path) {
                                    // RFC 3986, section 5.2.3, case 2
                                    lastSlashIndex = target.path.lastIndexOf('/');
                                    if (lastSlashIndex !== -1) {
                                        path = target.path.slice(0, lastSlashIndex + 1) + path;
                                    }
                                }
                            }
                            // remove .. / .  as part of the resolution process
                            target.path = Path.normalize(path);
                        }
                    }
                } else if (o === 'query') {
                    if (override || relativeUri.query.toString()) {
                        target.query = relativeUri.query.clone();
                        override = 1;
                    }
                } else if (override || relativeUri[o]) {
                    target[o] = relativeUri[o];
                    override = 1;
                }
            });

            return target;

        },

        /**
         * Get scheme part
         */
        getScheme: function () {
            return this.scheme;
        },

        /**
         * Set scheme part
         * @param {String} scheme
         * @chainable
         */
        setScheme: function (scheme) {
            this.scheme = scheme;
            return this;
        },

        /**
         * Return hostname
         * @return {String}
         */
        getHostname: function () {
            return this.hostname;
        },

        /**
         * Set hostname
         * @param {String} hostname
         * @chainable
         */
        setHostname: function (hostname) {
            this.hostname = hostname;
            return this;
        },

        /**
         * Set user info
         * @param {String} userInfo
         * @chainable
         */
        'setUserInfo': function (userInfo) {
            this.userInfo = userInfo;
            return this;
        },

        /**
         * Get user info
         * @return {String}
         */
        getUserInfo: function () {
            return this.userInfo;
        },

        /**
         * Set port
         * @param {String} port
         * @chainable
         */
        'setPort': function (port) {
            this.port = port;
            return this;
        },

        /**
         * Get port
         * @return {String}
         */
        'getPort': function () {
            return this.port;
        },

        /**
         * Set path
         * @param {string} path
         * @chainable
         */
        setPath: function (path) {
            this.path = path;
            return this;
        },

        /**
         * Get path
         * @return {String}
         */
        getPath: function () {
            return this.path;
        },

        /**
         * Set query
         * @param {String|Uri.Query} query
         * @chainable
         */
        'setQuery': function (query) {
            if (lib.isString(query)) {
                if (lib.startsWith(query, '?')) {
                    query = query.slice(1);
                }
                query = new Query(encodeSpecialChars(query, reDisallowedInQuery));
            }
            this.query = query;
            return this;
        },

        /**
         * Get query
         * @return {Uri.Query}
         */
        getQuery: function () {
            return this.query;
        },

        /**
         * Get fragment
         * @return {String}
         */
        getFragment: function () {
            return this.fragment;
        },

        /**
         * Set fragment
         * @param {String} fragment
         * @chainable
         */
        'setFragment': function (fragment) {
            var self = this;
            if (lib.startsWith(fragment, '#')) {
                fragment = fragment.slice(1);
            }
            self.fragment = fragment;
            return self;
        },

        /**
         * Judge whether two uri has same domain.
         * @param {Uri} other
         * @return {Boolean}
         */
        isSameOriginAs: function (other) {
            var self = this;
            // port and hostname has to be same
            return equalsIgnoreCase(self.hostname, other.hostname) &&
                equalsIgnoreCase(self.scheme, other.scheme) &&
                equalsIgnoreCase(self.port, other.port);
        },

        /**
         * Serialize to string.
         * See rfc 5.3 Component Recomposition.
         * But kissy does not differentiate between undefined and empty.
         * @param {Boolean} [serializeArray=true]
         * whether append [] to key name when value 's type is array
         * @return {String}
         */
        toString: function (serializeArray) {

            var out = [],
                self = this,
                scheme,
                hostname,
                path,
                port,
                fragment,
                query,
                userInfo;

            if ((scheme = self.scheme)) {
                out.push(encodeSpecialChars(scheme, reDisallowedInSchemeOrUserInfo));
                out.push(':');
            }

            if ((hostname = self.hostname)) {
                out.push('//');
                if ((userInfo = self.userInfo)) {
                    out.push(encodeSpecialChars(userInfo, reDisallowedInSchemeOrUserInfo));
                    out.push('@');
                }

                out.push(encodeURIComponent(hostname));

                if ((port = self.port)) {
                    out.push(':');
                    out.push(port);
                }
            }

            if ((path = self.path)) {
                if (hostname && !lib.startsWith(path, '/')) {
                    path = '/' + path;
                }
                path = Path.normalize(path);
                out.push(encodeSpecialChars(path, reDisallowedInPathName));
            }

            if ((query = ( self.query.toString.call(self.query, serializeArray)))) {
                out.push('?');
                out.push(query);
            }

            if ((fragment = self.fragment)) {
                out.push('#');
                out.push(encodeSpecialChars(fragment, reDisallowedInFragment));
            }

            return out.join('');
        }
    };

    Uri.Query = Query;

    Uri.getComponents = function (url) {
        url = url || EMPTY_STR;
        var m = url.match(URI_SPLIT_REG) || [],
            ret = {};
        each(REG_INFO, function (index, key) {
            ret[key] = m[index];
        });
        return ret;
    };

    lib.Uri = Uri;
}
{
    var logger = lib.getLogger();
    var win = navInfo.host,

        doc = win.document,
        docElem = doc && doc.documentElement,
        location = win.location,
        domReady = 0,
        callbacks = [],
    // The number of poll times.
        POLL_RETIRES = 500,
    // The poll interval in milliseconds.
        POLL_INTERVAL = 40,
    // #id or id
        RE_ID_STR = /^#?([\w-]+)$/,
        RE_NOT_WHITESPACE = /\S/,
        standardEventModel = !!(doc && doc.addEventListener),
        DOM_READY_EVENT = 'DOMContentLoaded',
        READY_STATE_CHANGE_EVENT = 'readystatechange',
        LOAD_EVENT = 'load',
        COMPLETE = 'complete',
        addEventListener = standardEventModel ? function (el, type, fn) {
            el.addEventListener(type, fn, false);
        } : function (el, type, fn) {
            el.attachEvent('on' + type, fn);
        },
        removeEventListener = standardEventModel ? function (el, type, fn) {
            el.removeEventListener(type, fn, false);
        } : function (el, type, fn) {
            el.detachEvent('on' + type, fn);
        };

    lib.mix(lib, {
        isWindow: function (obj) {
            // must use == for ie8
            /*jshint eqeqeq:false*/
            return obj != null && obj == obj.window;
        },
        globalEval: function (data) {
            if (data && RE_NOT_WHITESPACE.test(data)) {
                // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
                // http://msdn.microsoft.com/en-us/library/ie/ms536420(v=vs.85).aspx always return null
                /*jshint evil:true*/
                if (win.execScript) {
                    win.execScript(data);
                } else {
                    (function (data) {
                        win.eval.call(win, data);
                    })(data);
                }
            }
        },

        ready: function (fn) {
            if (domReady) {
                try {
                    fn(lib);
                } catch (e) {
                    lib.log(e.stack || e, 'error');
                    setTimeout(function () {
                        throw e;
                    }, 0);
                }
            } else {
                callbacks.push(fn);
            }
            return this;
        }
    });

    function fireReady() {
        if (domReady) {
            return;
        }
        // nodejs
        if (doc && !navInfo.nodejs) {
            removeEventListener(win, LOAD_EVENT, fireReady);
        }
        domReady = 1;
        for (var i = 0; i < callbacks.length; i++) {
            try {
                callbacks[i](lib);
            } catch (e) {
                lib.log(e.stack || e, 'error');
                /*jshint loopfunc:true*/
                setTimeout(function () {
                    throw e;
                }, 0);
            }
        }
    }

    //  Binds ready events.
    function bindReady() {
        // Catch cases where ready() is called after the
        // browser event has already occurred.
        if (!doc || doc.readyState === COMPLETE) {
            fireReady();
            return;
        }

        // A fallback to window.onload, that will always work
        addEventListener(win, LOAD_EVENT, fireReady);

        // w3c mode
        if (standardEventModel) {
            var domReady = function () {
                removeEventListener(doc, DOM_READY_EVENT, domReady);
                fireReady();
            };

            addEventListener(doc, DOM_READY_EVENT, domReady);
        }
        // IE event model is used
        else {
            var stateChange = function () {
                if (doc.readyState === COMPLETE) {
                    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
                    fireReady();
                }
            };

            // ensure firing before onload (but completed after all inner iframes is loaded)
            // maybe late but safe also for iframes
            addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);

            // If IE and not a frame
            // continually check to see if the document is ready
            var notframe,
                doScroll = docElem && docElem.doScroll;

            try {
                notframe = (win.frameElement === null);
            } catch (e) {
                notframe = false;
            }

            // can not use in iframe,parent window is dom ready so doScroll is ready too
            if (doScroll && notframe) {
                var readyScroll = function () {
                    try {
                        // Ref: http://javascript.nwbox.com/IEContentLoaded/
                        doScroll('left');
                        fireReady();
                    } catch (ex) {
                        setTimeout(readyScroll, POLL_INTERVAL);
                    }
                };
                readyScroll();
            }
        }
    }

    // bind on start
    // in case when you bind but the DOMContentLoaded has triggered
    // then you has to wait onload
    // worst case no callback at all
    bindReady();

    if (navInfo.bIE) {
        try {
            doc.execCommand('BackgroundImageCache', false, true);
        } catch (e) {
        }
    }
}


//change event to has which like jquery
//need test compatibility
lib.switchEvent = function(e)
{
    e = e || window.event;

    if (e.which == null) {
        e.which = (e.button < 2) ? 1 : ((e.button == 4) ? 2 : 3);
    } else {
        e.which = (e.which < 2) ? 1 : ((e.which == 2) ? 2 : 3);

    }

    return e;
};

//get current style
//need test compatibility
lib.currentStyle = function(obj, prop) {
    if (obj.currentStyle) {
        return obj.currentStyle[prop];
    }
    else if (window.getComputedStyle) {
        propprop = prop.replace (/([A-Z])/g, "-$1");
        propprop = prop.toLowerCase ();
        return document.defaultView.getComputedStyle (obj,null)[prop];
    }      
    return null;
}   

lib.extend = function(ParentClass, childAddConstructor){
    /// <summary>
    /// Parents constructor shouldn't has deference performances when given params more than it need.
    /// Child add constructor must has params that parent constructor need.
    /// Child add constructor could be add more params at back of parent's.<br />
    /// @return a child constructor or called a child class.
    /// </summary>
    /// <param name="ParentClass" type="function">parent constructor</param>
    /// <param name="childAddConstructor" type="function" optional="true">
    /// child add constructor,the extend has inited parent's,so only care the child.<br />
    /// @template: function( parent's params ...  [, child's params ... ]){ child operation ... }
    /// </param>
    /// <returns type="function"></returns>
    var ChildClass = function(){
        ParentClass.apply(this, arguments);
        if(childAddConstructor){
            childAddConstructor.apply(this, arguments);
        }
    };
    for(var i in ParentClass.prototype){
        ChildClass.prototype[i] = ParentClass.prototype[i];
    }
    ChildClass.prototype.constructor = ChildClass;
    return ChildClass;
};

lib.colorStrToInt = function(str){  
    var mystr = "0x";

    if(/^(rgb|RGB)/.test(str)){
        var nums = str.replace(/[^\d,.]/g,"").split(",");
        for(var i = 0; i < 3; ++i){  
            var hex = Number(nums[i]).toString(16);  
            if(hex.length == 1){
                hex = "0"+hex;
            }
            mystr += hex;
        }
        if(nums.length == 4){
            // rgba
            var hex = Math.round(Number(nums[i]) * 0xff).toString(16); 
            if(hex.length == 1){
                hex = "0"+hex;
            }
            mystr += hex;
        }else{
            // rgb
            mystr += "ff";
        }
    }else if(str == "transparent"){
        // transparent
        mystr += "00000000";
    }else if(/^#[0-9a-fA-f]{6}$/.test(str)){
        // #ffffff
        mystr += str.replace(/#/,"") + "ff"; 
    }else if(/^#[0-9a-fA-f]{3}$/.test(str)){
        // #fff
        for(var i = 0; i < 3; ++i){
            mystr += str[i]+str[i];
        }
        mystr += "ff";
    }else{
        mystr = "-1";
    }
    return Number(mystr);
};

lib.IntToColorStr = function(value){
    if(value > 0xffffffff || value < 0x00000000){
        // out of range, return null
        return null;
    }
    var str;
    if(!navInfo.bHTML5Edition){
        // below ie 8
        if(value % 0x100 == 0){
            str = "transparent";
        }else{
            str = Math.floor(value / 0x100).toString(16); 
            while(str.length != 6){
                str = '0' + str;
            }
            str = '#' + str;
        }
    }else{
        // up ie 9
        str = "rgba(" + 
            Math.floor(value / 0x1000000) + "," +
            Math.floor(value / 0x10000) % 0x100 + "," +
            Math.floor(value / 0x100) % 0x100 + "," +
            (value % 0x100) / 0xff + ")";
    }
    return str;
};

var customEvent = {

	fire: function(type){
		var self = this, args;
		
		self.exec = self.exec || {};
		type = type.toLowerCase();
		args = AP.slice.call(arguments, 1);
		each(self.exec[type] || [], function(item){
			var fn=item.f,ctx=item.c||self;
			try{fn.apply(ctx, args);}catch(e){console.log(e);}
		});
	},
	on: function(type, fn, ctx){
		var self = this;
		self.exec = self.exec || {};
		type = type.toLowerCase();
		self.exec[type] = self.exec[type] || [];
		self.exec[type].push({f:fn,c:ctx});
	},
	off: function(type, fn, c){
		var self = this,
			exec = self.exec;
			
		if(!exec){return;}
		if(!type){
			self.exec = null;
			return;
		}
		type = type.toLowerCase();
		if(!fn){
			exec[type] = null;
			return;
		}
		var arr = exec[type] || [];		
		for(var i = arr.length-1; i >=0; i--){
			if(arr[i] === fn){
				arr.splice(i, 1);
			}
		} 
	}
};

	function Attributes(config){
		var self=this;
		self.__attrs={};
		self.__attrVals={};
		
		self.userConfig = config;
		while(c) {
		  self.addAttrs(c.ATTRS);
		  c = c.superclass ? c.superclass.constructor : null
		}
		lib.mix(self.__attrs, config);
	}

	lib.mix(Attributes.prototype, {
		get: function(name){
			var self=this;
			if(name in self.__attrs)
				return self.__attrs[name];
			return '';
		},
		set: function(name,v){
			var self=this;
			if(name in self.__attrs)
				self.__attrs[name]=v;
		}, 
		addAttrs:function(attrsConfig) {
			lib.mix(this.__attrs, attrsConfig)
		}
	});

	Attributes.extend = function(px) {
		var SuperClass = this, childAddConstructor, ret;
		px = px || {};
		if(px.constructor)
			childAddConstructor=px.constructor;
		ret = extend(SuperClass, childAddConstructor);
		lib.mix(ret, px);
		return ret;
	};
	lib.obj = {'Attributes': Attributes, 'customEvent': customEvent};

})(dynamsoft.lib);
/**
 * Sizzle CSS Selector Engine v2.3.4-pre
 * https://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-08-15
 */
(function(lib) {

var i, REGEXP=RegExp,
	support,
	Expr,
	getText,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML=!0,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "dws_" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// Instance methods
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// https://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = ["\\[", whitespace, "*(", identifier, ")(?:", whitespace,
		// Operator (capture 2)
		"*([*^$|!~]?=)", whitespace,
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(", identifier, "))|)", whitespace,
		"*\\]"].join(''),


	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new REGEXP( whitespace + "+", "g" ),
	rtrim = new REGEXP( ["^", whitespace, "+|((?:^|[^\\\\])(?:\\\\.)*)", whitespace, "+$"].join(''), "g" ),

	rcomma = new REGEXP( ["^", whitespace, "*,", whitespace, "*"].join('') ),
	rcombinators = new REGEXP( ["^", whitespace, "*([>+~]|", whitespace, ")", whitespace, "*"].join('') ),

	rattributeQuotes = new REGEXP( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	ridentifier = new REGEXP( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new REGEXP( "^#(" + identifier + ")" ),
		"CLASS": new REGEXP( "^\\.(" + identifier + ")" ),
		"TAG": new REGEXP( "^(" + identifier + "|[*])" ),
		"ATTR": new REGEXP( "^" + attributes ),
		
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new REGEXP( ["^", whitespace, "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(",
			whitespace, "*((?:-\\d)?\\d*)", whitespace, "*\\)|)(?=[^-]|$)"].join(''), "i" )
	},


	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	// CSS string/identifier serialization
	// https://drafts.csswg.org/cssom/#common-serializing-idioms
	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
	fcssescape = function( ch, asCodePoint ) {
		if ( asCodePoint ) {

			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
			if ( ch === "\0" ) {
				return "\uFFFD";
			}

			// Control characters and (dependent upon position) numbers get escaped as code points
			return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
		}

		// Other potentially-special ASCII characters get backslash-escaped
		return "\\" + ch;
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		{

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rcssescape, fcssescape );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[i] = "#" + nid + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert( fn ) {
	var el = document.createElement("fieldset");

	try {
		return !!fn( el );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( el.parentNode ) {
			el.parentNode.removeChild( el );
		}
		// release memory in IE
		el = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {

}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			a.sourceIndex - b.sourceIndex;

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};


/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( preferredDoc !== document &&
		(subWindow = document.defaultView) && subWindow.top !== subWindow ) {

		// Support: IE 11, Edge
		if ( subWindow.addEventListener ) {
			subWindow.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( subWindow.attachEvent ) {
			subWindow.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( el ) {
		el.className = "i";
		return !el.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( el ) {
		el.appendChild( document.createComment("") );
		return !el.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programmatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( el ) {
		docElem.appendChild( el ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID filter and find
	if ( support.getById ) {
		Expr.filter["ID"] = function( id ) {
			var attrId = id;
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		Expr.filter["ID"] =  function( id ) {

			var attrId = new REGEXP(['^',id,'$'].join(''), 'g');
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && attrId.test(node.value);
			};
		};

	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See https://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( el ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// https://bugs.jquery.com/ticket/12359
			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( el.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !el.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !el.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibling-combinator selector` fails
			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( el ) {
			el.innerHTML = "<a href='' disabled='disabled'></a>" +
				"<select disabled='disabled'><option/></select>";

			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			el.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( el.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( el.querySelectorAll(":enabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: IE9-11+
			// IE's :disabled selector does not pick up the children of disabled fieldsets
			docElem.appendChild( el ).disabled = true;
			if ( el.querySelectorAll(":disabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			el.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( el ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( el, "*" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( el, "[s!='']:x" );
			//rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new REGEXP( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new REGEXP( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};


Sizzle.escape = function( sel ) {
	return (sel + "").replace( rcssescape, fcssescape );
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	match: matchExpr,

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new REGEXP( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		}

		
	
	}
};


// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens=[], type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {
		
		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( skip && skip === elem.nodeName.toLowerCase() ) {
							elem = elem[ dir ] || elem;
						} else if ( (oldCache = uniqueCache[ key ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, 
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( el ) {
	// Should return 1, but returns 4 (following)
	return el.compareDocumentPosition( document.createElement("fieldset") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( el ) {
	el.innerHTML = "<a href='#'></a>";
	return el.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name ) {
		
		return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( el ) {
	el.innerHTML = "<input/>";
	el.firstChild.setAttribute( "value", "" );
	return el.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name ) {
		if (elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( el ) {
	return el.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name ) {
		var val;
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
	});
}

lib.support = support;
lib.all = Sizzle;


})(dynamsoft.lib);
(function(lib){
	var AP = Array.prototype, 
		slice = AP.slice, push = AP.push, makeArray = lib.makeArray,
		doc=document,
		docElem=doc.documentElement;
  
	function NodeList(html, props, ownerDocument) {
		var self = this;
		if(!(self instanceof NodeList)) {
		  return new NodeList(html, props, ownerDocument)
		}
		if(!html) {
		  return self
		}
		if(typeof html === "string") {
			lib.error('Err 4001.');
			return self
		}
		
		if(lib.isArray(html) || html['isNodeList']) {
		  push.apply(self, makeArray(html));
		  return self
		}
		self[0] = html;
		self.length = 1;
		return self
	}
	
	var NodeListP;
	
	NodeListP = NodeList.prototype = {
		isNodeList:true, 
		length:0, 
		item:function(index) {
			var self = this;
			if(lib.isNumber(index)) {
			  if(index >= self.length) {
				return null
			  }else {
				return new NodeList(self[index])
			  }
			}else {
			  return new NodeList(index)
			}
		}, slice:function() {
			return new NodeList(slice.apply(this, arguments))
		}, getDOMNodes:function() {
			return slice.call(this)
		}, each:function(fn, context) {
			var self = this;
			lib.each(self, function(n, i) {
			  n = new NodeList(n);
			  return fn.call(context || n, n, i, self)
			});
			return self
		}, getEL:function() {
			return this[0]
		}, all:function(selector) {
			var ret, self = this;
			if(self.length > 0) {
			  ret = NodeList.all(selector, self)
			}else {
			  ret = new NodeList();
			}
			return ret
		}, one:function(selector) {
			var self = this, all = self.all(selector), ret = all.length ? all.slice(0, 1) : null;
			return ret
		}};
		
	lib.mix(NodeList, {
		all:function(selector, context) {
			var ctx=context;
			if(ctx && ctx['isNodeList'])
				ctx=context.getEL();
			
			if(typeof selector === "string")
			{
				if((selector = lib.trim(selector)) && selector.length >= 3 && lib.startsWith(selector, "<") && lib.endsWith(selector, ">"))
					lib.err('Err 4002.');
				return new NodeList(lib.all(selector, ctx))
			}
			
			if(selector['isNodeList'])
				return selector;
			
			return new NodeList(selector)
		}, one:function(selector, context) {
			var all = NodeList.all(selector, context);
			return all.length ? all.slice(0, 1) : null
		}});
		
	lib.one = NodeList.one;


	// parseHTML
	// getStyles

	var support=lib.support, Sizzle=lib.all;

{
	var pixelPositionVal, pixelMarginRightVal, boxSizingReliableVal,
		reliableHiddenOffsetsVal, reliableMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	div.style.cssText = "float:left;opacity:.5";

	// Support: IE<9
	// Make sure that element opacity exists (as opposed to filter)
	support.opacity = div.style.opacity === "0.5";

	// Verify style float existence
	// (IE uses styleFloat instead of cssFloat)
	support.cssFloat = !!div.style.cssFloat;

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container = document.createElement( "div" );
	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	div.innerHTML = "";
	container.appendChild( div );

	// Support: Firefox<29, Android 2.3
	// Vendor-prefix box-sizing
	support.boxSizing = div.style.boxSizing === "" || div.style.MozBoxSizing === "" ||
		div.style.WebkitBoxSizing === "";

	lib.mix( support, {
		reliableHiddenOffsets: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableHiddenOffsetsVal;
		},

		boxSizingReliable: function() {

			// We're checking for pixelPositionVal here instead of boxSizingReliableVal
			// since that compresses better and they're computed together anyway.
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return boxSizingReliableVal;
		},

		pixelMarginRight: function() {

			// Support: Android 4.0-4.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelMarginRightVal;
		},

		pixelPosition: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelPositionVal;
		},

		reliableMarginRight: function() {

			// Support: Android 2.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginRightVal;
		},

		reliableMarginLeft: function() {

			// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginLeftVal;
		}
	} );

	function computeStyleTests() {
		var contents, divStyle;

		// Setup
		docElem.appendChild( container );

		div.style.cssText =

			// Support: Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";

		// Support: IE<9
		// Assume reasonable values in the absence of getComputedStyle
		pixelPositionVal = boxSizingReliableVal = reliableMarginLeftVal = false;
		pixelMarginRightVal = reliableMarginRightVal = true;

		// Check for getComputedStyle so that this code is not run in IE<9.
		if ( window.getComputedStyle ) {
			divStyle = window.getComputedStyle( div );
			pixelPositionVal = ( divStyle || {} ).top !== "1%";
			reliableMarginLeftVal = ( divStyle || {} ).marginLeft === "2px";
			boxSizingReliableVal = ( divStyle || { width: "4px" } ).width === "4px";

			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = ( divStyle || { marginRight: "4px" } ).marginRight === "4px";

			// Support: Android 2.3 only
			// Div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			contents = div.appendChild( document.createElement( "div" ) );

			// Reset CSS: box-sizing; display; margin; border; padding
			contents.style.cssText = div.style.cssText =

				// Support: Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
			contents.style.marginRight = contents.style.width = "0";
			div.style.width = "1px";

			reliableMarginRightVal =
				!parseFloat( ( window.getComputedStyle( contents ) || {} ).marginRight );

			div.removeChild( contents );
		}

		// Support: IE6-8
		// First check that getClientRects works as expected
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.style.display = "none";
		reliableHiddenOffsetsVal = div.getClientRects().length === 0;
		if ( reliableHiddenOffsetsVal ) {
			div.style.display = "";
			div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
			div.childNodes[ 0 ].style.borderCollapse = "separate";
			contents = div.getElementsByTagName( "td" );
			contents[ 0 ].style.cssText = "margin:0;border:0;padding:0;display:none";
			reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			if ( reliableHiddenOffsetsVal ) {
				contents[ 0 ].style.display = "";
				contents[ 1 ].style.display = "none";
				reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			}
		}

		// Teardown
		docElem.removeChild( container );
	}

}

var getStyles, curCSS,
	rposition = /^(top|right|bottom|left)$/;

if ( window.getComputedStyle ) {
	getStyles = function( elem ) {

		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var el,view;
		el = lib.isFunction(elem['getEL']) ? elem.getEL() : elem;
		
		view = el.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( el );
	};

	curCSS = function( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );

		// getPropertyValue is only needed for .css('filter') in IE9, see #12537
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		if ( computed ) {

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value"
			// instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values,
			// but width seems to be reliably pixels
			// this is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "";
	};
} else if ( docElem.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, computed ) {
		var left, rs, rsLeft, ret,
			style = elem.style;

		computed = computed || getStyles( elem );
		ret = computed ? computed[ name ] : undefined;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are
		// proportional to the parent element instead
		// and we can't measure the parent instead because it
		// might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "" || "auto";
	};
};



var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,
	rtagName = ( /<([\w:-]+)/ ),
	rleadingWhitespace = ( /^\s+/ ),
	rhtml = /<|&#?\w+;/,
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,
	// swappable if display is none or starts with table except
	// "table", "table-cell", or "table-caption"
	// see here for display values:
	// https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );
	
var cssExpand = [ "Top", "Right", "Bottom", "Left" ];
// We have to close these tags to support XHTML (#13200)
var wrapMap = {
	option: [ 1, "<select multiple='multiple'>", "</select>" ],
	legend: [ 1, "<fieldset>", "</fieldset>" ],
	area: [ 1, "<map>", "</map>" ],

	// Support: IE8
	param: [ 1, "<object>", "</object>" ],
	thead: [ 1, "<table>", "</table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
	// unless wrapped in a div with non-breaking characters in front of it.
	_default: support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>" ]
};
var emptyStyle, 
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
	nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|" +
		"details|dialog|figcaption|figure|footer|header|hgroup|main|" +
		"mark|meter|nav|output|picture|progress|section|summary|template|time|video";

{
	var div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}
	emptyStyle = div.style;

	// Verify style float existence
	// (IE uses styleFloat instead of cssFloat)
	support.cssFloat = !!div.style.cssFloat;
};

var fcamelCase = function( all, letter ) {
	return letter.toUpperCase();
};

var jQuery = {
	
	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},
	cssHooks: {},
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},
	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		while ( j < len ) {
			first[ i++ ] = second[ j++ ];
		}

		// Support: IE<9
		// Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)
		if ( len !== len ) {
			while ( second[ j ] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},
	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},	
	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": support.cssFloat ? "cssFloat" : "styleFloat"
	},
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	}
};

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt( 0 ).toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== "undefined" ?
				context.querySelectorAll( tag || "*" ) :
				undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context;
			( elem = elems[ i ] ) != null;
			i++
		) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}

function buildFragment( elems, context ) {
	var j, elem, contains,
		tmp, tag, tbody, wrap,
		l = elems.length,

		// Ensure a safe fragment
		safe = createSafeFragment( context ),

		nodes = [],
		i = 0;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( lib.type( elem ) === "object" ) {
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || safe.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;

				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Manually add leading whitespace removed by IE
				if ( !support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
					nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[ 0 ] ) );
				}

				// Remove IE's autoinserted <tbody> from table fragments
				if ( !support.tbody ) {

					// String was a <table>, *may* have spurious <tbody>
					elem = tag === "table" && !rtbody.test( elem ) ?
						tmp.firstChild :

						// String was a bare <thead> or <tfoot>
						wrap[ 1 ] === "<table>" && !rtbody.test( elem ) ?
							tmp :
							0;

					j = elem && elem.childNodes.length;
					while ( j-- ) {
						if ( jQuery.nodeName( ( tbody = elem.childNodes[ j ] ), "tbody" ) &&
							!tbody.childNodes.length ) {

							elem.removeChild( tbody );
						}
					}
				}

				jQuery.merge( nodes, tmp.childNodes );

				// Fix #12392 for WebKit and IE > 9
				tmp.textContent = "";

				// Fix #12392 for oldIE
				while ( tmp.firstChild ) {
					tmp.removeChild( tmp.firstChild );
				}

				// Remember the top-level container for proper cleanup
				tmp = safe.lastChild;
			}
		}
	}

	// Fix #11356: Clear elements from fragment
	if ( tmp ) {
		safe.removeChild( tmp );
	}

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		contains = Sizzle.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( safe.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

	}

	tmp = null;

	return safe;
}

function createSafeFragment( doc ) {
	var list = nodeNames.split( "|" ),
		safeFrag = doc.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};

var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;
var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = support.boxSizing &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {

		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test( val ) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	);
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?

		// If we already have the right measurement, avoid augmentation
		4 :

		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {

		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function rcssNum( pnum ) {
	return new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );
};

function setPositiveNumber( elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum(value);
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted,
		scale = 1,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		do {

			// If previous iteration zeroed out, double until we get *something*.
			// Use string for doubling so we don't accidentally see scale as unchanged below
			scale = scale || ".5";

			// Adjust and apply
			initialInUnit = initialInUnit / scale;
			jQuery.style( elem, prop, initialInUnit + unit );

		// Update scale, tolerating zero or NaN from tween.cur()
		// Break the loop if scale is unchanged or perfect, or if we've just had enough.
		} while (
			scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
		);
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}

lib.each( [ "height", "width" ], function( name, i ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
					elem.offsetWidth === 0 ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					support.boxSizing &&
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
} );

	// Get and set the style property on a DOM Node
	lib.style = jQuery.style = function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				style[ name ] = value;
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	};
	
	lib.css = jQuery.css = function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}
		return val;
	};
	
{  
	var SPACE = " ", RE_CLASS = /[\n\t\r]/g,
		norm = function (elemClass) {
			return(SPACE + elemClass + SPACE).replace(RE_CLASS, SPACE)
		},
		_addClass=function(elem, classNames) {
			var elemClass = elem.className, normClassName, cl = classNames.length, setClass, j;
			if(elemClass) {
				normClassName = norm(elemClass);
				setClass = elemClass;
				j = 0;
				for(;j < cl;j++) {
					if(normClassName.indexOf(SPACE + classNames[j] + SPACE) < 0) {
						setClass += SPACE + classNames[j]
					}
				}
				setClass = lib.trim(setClass)
			}else {
				setClass = classNames.join(" ")
			}
			elem.className = setClass
		}, _removeClass=function(elem, classNames) {
			var elemClass = elem.className, className, cl = classNames.length, j, needle;
			if(elemClass && cl) {
				className = norm(elemClass);
				j = 0;
				for(;j < cl;j++) {
					needle = SPACE + classNames[j] + SPACE;
					while(className.indexOf(needle) >= 0) {
						className = className.replace(needle, SPACE)
					}
				}
				elem.className = lib.trim(className)
			}
		};
	
	
	lib.mix(NodeListP,{
		before: function(item){
			var o=this.getEL(),el=item;
			if(typeof item === "string" && (item = lib.trim(item)) && item.length >= 3 && lib.startsWith(item, "<") && lib.endsWith(item, ">"))
				el = lib.parseHTML(item)[0];
				
			o.insertBefore(el,o.childNodes[0]);
		},
		append: function(item){
			var o=this.getEL(),el=item;
			if(typeof item === "string" && (item = lib.trim(item)) && item.length >= 3 && lib.startsWith(item, "<") && lib.endsWith(item, ">"))
				el = lib.parseHTML(item)[0];
			o.appendChild(el);
		},
		html: function(str){
			this.getEL().innerHTML = str;
		},
		attr: function(n, v)
		{
			var o=this.getEL();
			if(n == 'class')
				o.className=v;
			else
				o[n]=v;
		},
		style: function(n, v)
		{
			var o=this.getEL();
			jQuery.style(o, n, v);
		},
		css: function(styles)
		{
			var o=this.getEL();
			lib.each(styles, function(v,n){
				jQuery.style(o, n, v);
			});
		},
		addClass: function (_css) {
			var o=this.getEL();
			_addClass(o,_css.split(SPACE));
	    },
	    removeClass: function (_css) {
			var o=this.getEL();
			_removeClass(o,_css.split(SPACE));
	    },
		'parent': function()
		{
			var o=this.getEL();
			return new NodeList(o.parentNode);
		},
		remove: function()
		{
			var o=this.getEL();
			o.parentNode.removeChild(o);
		}
	});
	
}

	lib.parseHTML = function( data, context ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec( data );

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[ 1 ] ) ];
		}

		parsed = buildFragment( [ data ], context );

		return jQuery.merge( [], parsed.childNodes );
	};


})(dynamsoft.lib);/**
 * Dynamsoft JavaScript Library
 * @product Dynamsoft Webcam SDK
 * @website http://www.dynamsoft.com
 *
 * @preserve Copyright 2017, Dynamsoft Corporation
 * @author Dynamsoft R&D Team
 *
 * @version 5.1
 *
 * @fileoverview All polyfills would be put here.
 */

(function (lib) {
    // array.indexof
	var AP=Array.prototype,
		FP=Function.prototype;
	
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    // Production steps of ECMA-262, Edition 5, 15.4.4.14
    // Reference: http://es5.github.io/#x15.4.4.14
    if (!lib.isFunction(AP.indexOf)) {
        AP.indexOf = function (searchElement, fromIndex) {

            var k;

            // 1. Let o be the result of calling ToObject passing
            //    the this value as the argument.
            if (this == null) {
                return -1;
            }

            var o = Object(this);

            // 2. Let lenValue be the result of calling the Get
            //    internal method of o with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = o.length >>> 0;

            // 4. If len is 0, return -1.
            if (len === 0) {
                return -1;
            }

            // 5. If argument fromIndex was passed let n be
            //    ToInteger(fromIndex); else let n be 0.
            var n = +fromIndex || 0;

            if (Math.abs(n) === Infinity) {
                n = 0;
            }

            // 6. If n >= len, return -1.
            if (n >= len) {
                return -1;
            }

            // 7. If n >= 0, then Let k be n.
            // 8. Else, n<0, Let k be len - abs(n).
            //    If k is less than 0, then let k be 0.
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            // 9. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the
                //    HasProperty internal method of o with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                //    i.  Let elementK be the result of calling the Get
                //        internal method of o with the argument ToString(k).
                //   ii.  Let same be the result of applying the
                //        Strict Equality Comparison Algorithm to
                //        searchElement and elementK.
                //  iii.  If same is true, return k.
                if (k in o && o[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }

    // Enhanced Browser
	if (!lib.isFunction(FP.bind)) {
		FP.bind = function (context) {

            var self = this;
            if (1 < arguments.length) {
                // extra arguments to send by default
                var _args = AP.slice.call(arguments, 1);
                return function () {
                    return self.apply(
                        context,
                        arguments.length ?
                            // concat arguments with those received
                            _args.concat(AP.slice.call(arguments)) :
                            // send just arguments, no concat, no slice
                            _args
                    );
                };
            }
            return function () {
                return arguments.length ? self.apply(context, arguments) : self.call(context);
            };
        }
	}

    // string.trim
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
	if (!String.prototype.trim) {
	    String.prototype.trim = function () {
	        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	    };
	}
})(dynamsoft.lib);/**
 * Dynamsoft JavaScript Library
 * @product Dynamsoft Webcam SDK
 * @website http://www.dynamsoft.com
 *
 * @preserve Copyright 2017, Dynamsoft Corporation
 * @author Dynamsoft R&D Team
 *
 * @version 5.1
 *
 * @fileoverview Encapsulates some cross-browser functions which are associated with event, 
 * such as addEvent, removeEvent and detectButton etc.
 */

// addEvent / removeEvent
(function(dynam){
	var lib=dynam.lib,
		navInfo=dynam.navInfo,
		doc = window['document'], _ret, _funFixType;
	
	_funFixType = function(type){
	    var _type = type;
		if(_type == 'mousewheel'){
		    _type = navInfo.bGecko ? "DOMMouseScroll" : "mousewheel";

		    //"onwheel" in document.createElement("div") ? "wheel" : //     Modern browsers support "wheel"
		    //_type = document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
		    //    "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox
		}
		return _type;
	};

	_ret = {
		addEventListener : doc.addEventListener
			? function (element, type, fn) { var _type=_funFixType(type); if(element) element.addEventListener(_type, fn, false); }
			: function (element, type, fn) { var _type=_funFixType(type); if(element) element.attachEvent('on' + _type, fn); },

		removeEventListener : doc.removeEventListener
			? function (element, type, fn) { var _type=_funFixType(type); if(element) element.removeEventListener(_type, fn, false); }
			: function (element, type, fn) { var _type=_funFixType(type); if(element) element.detachEvent('on' + _type, fn); },
			

		getWheelDelta: function (evt) {
		    evt = evt || window.event;
			var delta, wheelDelta = evt.wheelDelta, detail = evt.detail;

			if(wheelDelta) {
			  delta = wheelDelta / 120;
			}
			if(detail) {
			  delta = -(detail % 3 === 0 ? detail / 3 : detail);
			}
			return delta;
		}
	};
	lib.mix(lib, _ret);
})(dynamsoft);

(function(DL){
	DL.Events = {'registedClass' : [], 'registedObjs' : []};

    //Add keydown / keyup Events
	var handler = function (e) {
	    e = e || window.event;
        var _ret = true;
        DL.each(DL.Events.registedObjs, function (item) {
			DL.each(DL.Events.registedClass, function (cls) {
				if (item instanceof cls) {
					if (item.bFocus && item.handlerKeyDown) {
						_ret = item.handlerKeyDown(e);
						if (!_ret)
							return false;
					}
				}
			});
        });
        return _ret;
    };

	DL.addEventListener(document.documentElement, 'keydown', handler);

})(dynamsoft.lib);

(function(DL){
    // stop the default behavior of a specified event
	DL.stopPropagation = function(evt){
	    var e = evt || window.event;
		if (e.preventDefault) e.preventDefault();

		if (e.stopPropagation) e.stopPropagation();

		e.returnValue = false;
		e.cancelBubble = true;
	}
})(dynamsoft.lib);

(function (lib) {
    var enumMouseButton = { LEFT: 0, MIDDLE: 1, RIGHT: 2 };
    lib.EnumMouseButton = enumMouseButton;
    lib.detectButton = function(evt) {
        evt = evt || window.event;

        if (evt.which == null) {
            return (evt.button < 2) ? enumMouseButton.LEFT :
                ((evt.button == 4) ? enumMouseButton.MIDDLE : enumMouseButton.RIGHT);
        }
        else {
            return (evt.which < 2) ? enumMouseButton.LEFT :
                ((evt.which == 2) ? enumMouseButton.MIDDLE : enumMouseButton.RIGHT);
        }
    };
	
	lib.fireEvent = function (name, el) {
		var event;
        if (doc.createEvent) {
            event = doc.createEvent('HTMLEvents');
            event.initEvent(name, TRUE, TRUE);
			
			if(el.dispatchEvent)
				el.dispatchEvent(event);
        } 
		else if (doc.createEventObject) {
			event = doc.createEventObject();
			event.bubbles = TRUE;
			event.cancelable = TRUE;
			el.fireEvent(name, event);
		}
		else {
            event = new Event(name);
			if(el.dispatchEvent)
				el.dispatchEvent(event);
        }
	};
})(dynamsoft.lib);/**
 * Dynamsoft JavaScript Library
 * @product Dynamsoft Webcam SDK
 * @website http://www.dynamsoft.com
 *
 * @preserve Copyright 2017, Dynamsoft Corporation
 * @author Dynamsoft R&D Team
 *
 * @version 5.1
 *
 * @fileoverview XmlHttpRequest wrapper.
 */
(function (lib, navInfo, undefined) {

    var win=window,
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget)$/,
	
	OK_CODE = 200,
	NO_CONTENT_CODE = 204,
	MULTIPLE_CHOICES = 300, 
	NOT_MODIFIED = 304, 
	NOT_FOUND_CODE = 404,
	NO_CONTENT_CODE2 = 1223,
	SERVER_ERR = 500,
	
    enumConnectionToServiceLost = -1022,        
	_strConnectionToServiceLostString = 'The local service (Dynamsoft Service) is disconnected.',
	
    _strOpenErr = 'open error: ',
    _strSendErr = 'send error: ',
	
	simulatedLocation = new lib.Uri(location.href), 
	isLocal = simulatedLocation && rlocalProtocol.test(simulatedLocation.getScheme()),
	XDomainRequest_ = false,//navInfo.bIE && (parseInt(navInfo.strBrowserVersion) > 8) && win.XDomainRequest,
	
	createStandardXHR = function () {
		try {
			return new win.XMLHttpRequest;
		}catch(e) {
		}
		return undefined;
	},

	createActiveXHR = function () {
		try {
			var http = false;
			// code for IE9,IE8,IE7,IE6,IE5
			lib.each(['Msxml2.XMLHTTP.6.0',
					'Msxml2.XMLHTTP',
					'Microsoft.XMLHTTP',
					'Msxml2.XMLHTTP.3.0',
					'Msxml3.XMLHTTP'],
				function(item){
					try {
						return (http=new win.ActiveXObject(item));
					}
					catch (e) {
						lib.error('new xhr error: ' + e.message);
					}
				});
			return http;
		}catch(e) {
		}
		return undefined;
	},

	supportCORS = (!isLocal && win.XMLHttpRequest) ? ('withCredentials' in (createStandardXHR() || [])) : false,
	
	//Create a xmlHttpRequest object
	_newXhr = win.ActiveXObject ? function (crossDomain) {
		
		if(navInfo.bIE && (parseInt(navInfo.strBrowserVersion) <= 9))
			return createActiveXHR();
		
		if(!supportCORS && crossDomain && XDomainRequest_) {
		    return new XDomainRequest_;
		}
	    return !isLocal && createStandardXHR() || createActiveXHR();

	} : createStandardXHR,
	
	isInstanceOfXDomainRequest = function (xhr) {
		return XDomainRequest_ && (xhr instanceof XDomainRequest_);
	},

	defaultConfig = {
			'url': false, //URL to be loaded
			'onSuccess': false, //Function that should be called at success
			'onError': false, //Function that should be called at error
			'onComplete': false,
			'method': "GET", //GET or POST	
			'async': true, // async or sync
			'xhrFields': false,
			'mimeType': false,
			'username': false,
			'password': false,
			'data': false,
			'dataType': 'text', //Return type - could be 'blob', 'text', 'xml', 'json', 'user-defined'(which is used for acquiring image data from service)
			'headers': false,
			'contentType': 'application/x-www-form-urlencoded; charset=UTF-8',
			'beforeSend': false,
			'afterSend': false,
			'timeout':0,
			'crossDomain':false
		},
	rnoContent = /^(?:GET|HEAD)$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,
	accepts={'xml':"application/xml, text/xml", 'html':"text/html", 'text':"text/plain", 'json':"application/json, text/javascript", "*":"*/*"},
	nilFun=lib.nil, FUNS, _ret;
	
	// IE<=8 fixed
	if(navInfo.bIE && parseInt(navInfo.strBrowserVersion)<=10)
	{
		nilFun=lib.noop;
	}
	
	FUNS = {

		setRequestHeader:function(name, value) {
			var self = this;
			self.headers[name] = value;
			return self;
		}, getAllResponseHeaders:function() {
			var self = this;
			return self.state === 2 ? self.responseHeadersString : null;
		}, getNativeXhr:function() {
			var self = this;
			return self.nativeXhr;
		}, getResponseHeader:function(name) {
			var match, self = this, responseHeaders;
			name = name.toLowerCase();
			if(self.state === 2) {
			  if(!(responseHeaders = self.responseHeaders)) {
				responseHeaders = self.responseHeaders = {};
				while(match = rheaders.exec(self.responseHeadersString)) {
				  responseHeaders[match[1].toLowerCase()] = match[2];
				}
			  }
			  match = responseHeaders[name];
			}
			return match === undefined ? null : match;
		}, overrideMimeType:function(type) {
			var self = this;
			if(!self.state) {
			  self.mimeType = type;
			}
			return self;
		}, abort:function(statusText) {
			var self = this;
			statusText = statusText || "abort";
			if(self.nativeXhr) {
				self.nativeXhr.abort();
			}
			self._ioReady(0, statusText);
			return self;
		}, _ioReady:function(status, statusText) {
			var self = this, isSuccess;
			if(self.state === 2) {
			  return;
			}
			self.state = 2;
			self.readyState = 4;
			
			if(status >= OK_CODE && status < MULTIPLE_CHOICES || status === NOT_MODIFIED) {
				if(status === NOT_MODIFIED) {
					statusText = "not modified";
					isSuccess = true;
				}else {
					statusText = "success";
					isSuccess = true;
				}
			}else {
				if(status < 0) {
					status = 0;
				}
			}
			
			try {
				if(status >= OK_CODE)
					self.handleResponseData();
			}catch(e) {
				lib.error(e.stack || e, "error");
				statusText = e.message || "parser error";
			}
			
			self.status = status;
			self.statusText = statusText;
			var config = self, timeoutTimer;
			if(timeoutTimer = self.timeoutTimer) {
				clearTimeout(timeoutTimer);
				self.timeoutTimer = 0;
			}
			var handler = isSuccess ? "onSuccess" : "onError", h, 
				v = [self.responseData, statusText, self], context = config.context;

			h = config[handler];
			if(lib.isFunction(h)) {
			  h.apply(context, v);
			}
			
			h = config['onComplete'];
			if(lib.isFunction(h)) {
			  h.apply(context, v);
			}
			
		},
		handleResponseData: function () {
			var self=this, result, dataType = self.dataType, nativeXhr=self.nativeXhr;
			
			if (dataType === 'blob' || dataType === 'arraybuffer') {
			    result = !!win.Blob ? nativeXhr.response : nativeXhr.responseBody;
			} else if (dataType == 'json') {
			    if (nativeXhr.responseType && nativeXhr.responseType.toLowerCase() == 'json') {
			        result = nativeXhr.response;
			    } else {
			        result = nativeXhr.responseText ?
			        ((win.JSON && win.JSON.parse) ? win.JSON.parse(nativeXhr.responseText) : lib.parse(nativeXhr.responseText)) :
			        {};
			    }
			} else if (dataType === 'user-defined') {
			    result = nativeXhr.response !== undefined ? nativeXhr.response : nativeXhr.responseText;
			} else {	// text or xml
				self.responseText = result = nativeXhr.responseText || '';
				try{
					var xml=nativeXhr.responseXML;
					if(xml && xml.documentElement /*#4958#*/){
						self.responseXML = xml;
					}
				}catch(e){}
			}
			
			self.responseData = result;
		},

		sendInternal: function() {
			//The XMLHttpRequest object is recreated at every call - to defeat Cache problem in IE
			var c=this, self=c, i, 
				method, url, dataType,
				nativeXhr, xhrFields, mimeType, requestHeaders, 
				hasContent, sendContent; 

			
			method=c.method;
			url=c.url;
			dataType=c.dataType;
			mimeType=c.mimeType;
			
			if (!lib.isString(url)) return;
			
			self.nativeXhr = nativeXhr = _newXhr(c.crossDomain);
			if (!nativeXhr) return;

		    try {
		        self.state = 1;

		        if (c.username) {
		            nativeXhr.open(method, url, c.async, c.username, c['password']);
		        } else {
		            nativeXhr.open(method, url, c.async);
		        }
				
		        if ((c.async || navInfo.bIE) && dataType && dataType != 'user-defined' && ('responseType' in nativeXhr))
				{
					try {
					    nativeXhr.responseType = dataType;
					}catch (e){}
				}
				
		    } catch (ex) {
		        if (self.state < 2) {
		            lib.error(ex.stack || ex, "error");
		            self._ioReady(-1, _strOpenErr +
                        (lib.isNumber(ex.number) ? '(' + ex.number + ')' : '') +
                        (ex.message || ''));
		        } else {
		            lib.error(ex);
		        }

		        return;
		    }

		    xhrFields = c.xhrFields || {};
			if ('withCredentials' in xhrFields) {
				if (!supportCORS) {
					delete xhrFields.withCredentials;
				}
			}
			
			for (i in xhrFields) {
				try {
					nativeXhr[i] = xhrFields[i];
				} catch (e) {
					lib.error(e);
				}
			}
			
			// Override mime type if supported
			if (mimeType && nativeXhr.overrideMimeType) {
				nativeXhr.overrideMimeType(mimeType);
			}
			
			requestHeaders = c.headers || {};
			var xRequestHeader = requestHeaders['X-Requested-With'];
			if (xRequestHeader === false) {
				delete requestHeaders['X-Requested-With'];
			}
			
			// ie<10 XDomainRequest does not support setRequestHeader
			if (typeof nativeXhr.setRequestHeader !== 'undefined') {
				
				if(c.contentType) {
				    nativeXhr.setRequestHeader("Content-Type", c.contentType);
				}
				
				nativeXhr.setRequestHeader("Accept", dataType && accepts[dataType] ? accepts[dataType] + (dataType === "*" ? "" : ", */*; q=0.01") : accepts["*"]);
			
				for (i in requestHeaders) {
				    nativeXhr.setRequestHeader(i, requestHeaders[i]);
				}
			}
			
			hasContent = !rnoContent.test(c.method);
			sendContent = hasContent && c.data || null;

			if (hasContent && navInfo.bIE && parseInt(navInfo.strBrowserVersion) < 10) {
			    sendContent = c.data;
			}
			
			// timeout
			if(c.async && c.timeout > 0) {
			    self.timeoutTimer = setTimeout(function() {
			        self.abort("timeout");
			    }, c.timeout * 1E3);
			}
			
			try {
				self.state = 1;
				if(lib.isFunction(self.beforeSend)){
					var r=self.beforeSend(nativeXhr, self);
					if(r===false){
						self.abort("cancel");
						return;
					}
				}
				nativeXhr.send(sendContent);
				if(lib.isFunction(self.afterSend))
					self.afterSend(self);
			}catch(e) {
				if(self.state < 2) {
					lib.error(e.stack || e, "error");
					self._ioReady(-1, _strSendErr + (e.message || ''));
				}else {
					lib.error(e);
				}
			}
			
			if (!c.async || nativeXhr.readyState === 4) {
				self._callback();
			} else {
				if (isInstanceOfXDomainRequest(nativeXhr)) {
					nativeXhr.onload = function () {
						nativeXhr.readyState = 4;
						nativeXhr.status = OK_CODE;
						self._callback();
					};
					nativeXhr.onerror = function () {
						nativeXhr.readyState = 4;
						nativeXhr.status = SERVER_ERR;
						self._callback();
					};
				} else {
					nativeXhr.onreadystatechange = function () {
						self._callback();
					};
				}
			}
		},

		_callback : function(evt, abort) { //Call a function when the state changes.
			var self=this, nativeXhr=self.nativeXhr;

			try{
				if (nativeXhr.readyState === 4 || abort) { //Ready State will be 4 when the document is loaded.
					if(isInstanceOfXDomainRequest(nativeXhr)) {
						nativeXhr.onerror = nilFun;
						nativeXhr.onload = nilFun;
					} else {
						nativeXhr.onreadystatechange = nilFun;
					}
					
					if(abort) {
						if(nativeXhr.readyState !== 4) {
						    nativeXhr.abort();
						}
					} else {
						
						if(!isInstanceOfXDomainRequest(nativeXhr)) {
						    self.responseHeadersString = nativeXhr.getAllResponseHeaders();
						}
						
						var status=nativeXhr.status,statusText;
						try {
							statusText = nativeXhr.statusText;
						}catch(e) {
						    lib.error("xhr statusText error: ");
						    lib.error(e);
						    statusText = "";
						}
						
						self._ioReady(status, statusText);
					}
				}

			}catch(e){
			    lib.error(e.stack || e, "error");

			    if (e.errorCode === enumConnectionToServiceLost) {
                    throw {
                        errorCode: enumConnectionToServiceLost,
                        //level: "",
                        errorString: _strConnectionToServiceLostString,
                        //htmlMessage: "",
                        toString: function () { return this.errorCode + ": " + this.errorString; }
                    };
                }

				nativeXhr.onreadystatechange = nilFun;
				if(!abort) {
				    self._ioReady(-1, e.message || "process error");
				}
			}
		},
		
		_setupCfg: function(opt)
		{
			var self=this, dataType, i, requestHeaders, url, uri;
			
			url = opt.url;

			if(lib.startsWith(url,'http://') || lib.startsWith(url,'https://')) {
				uri = new lib.Uri(url);
			} else {
				if(lib.startsWith(url,'//')) {
					opt.url = url = 'http:' + url;
				}

				uri = simulatedLocation.resolve(url);
			}

			if (!opt.dataType) 
				dataType = 'text'; //Default return type is 'text'
			else
				dataType = opt.dataType.toLowerCase();
			opt.dataType = dataType;

			if (!opt.method)
				opt.method = 'GET'; //Default method is GET
			else
				opt.method = opt.method.toUpperCase();
						
			if(!("crossDomain" in opt)) {
			    opt.crossDomain = !uri.isSameOriginAs(simulatedLocation);
			}
			
			requestHeaders = opt.headers;
			for (i in requestHeaders) {
				if(lib.isUndefined(requestHeaders[i]))
					delete requestHeaders[i];
			}
			lib.mix(self,opt);
			
			self.state = 1;
		}
    };
	
	function io(c){
		var self = this;
		if (!c || !lib.isString(c.url)){
			lib.log('the url is error.');
			return; //Return if a url is not provided
		}

		if(!(self instanceof io)) {
			return new io(c);
		}

		lib.mix(self,defaultConfig);
		lib.mix(self,FUNS);
		
		if(c instanceof io)
			c=c.config;
		self.config=c;
		self.config.context=self;
		self._setupCfg(c);

		self.sendInternal();
	};
	
    io._strOpenErr = _strOpenErr;
    io._strSendErr = _strSendErr;
	io._strConnectionToServiceLostString = _strConnectionToServiceLostString;
	
	_ret = {
		'ajax': io,
		'io':{
			
			/**
			 * Communicate with the server by GET method.
			 * @param {string} url - The server url
			 * @param {function} sFun - Function that would be called when success.
			 * @param {function} fFun - Function that would be called when error.
			 * @param {string} dataType - The server response type expected. Could be 'json','blob','text','xml'. 
			 */
			'get': function(url, sFun, fFun, dataType) {

				return new io({
				    'method': "GET",
					'url': url,
					'onSuccess': sFun,
					'onError': fFun,
					'dataType': dataType
				});
			},
			
			/**
			 * Communicate with the server by POST method.
			 * @param {string} url - The server url
			 * @param {object} data - The post data
			 * @param {function} sFun - Function that would be called when success.
			 * @param {function} fFun - Function that would be called when error.
			 * @param {string} dataType - The server response type expected. Could be 'json','blob','text','xml'. 
			 */
			'post': function(url, data, sFun, fFun, dataType) {
				return new io({
				    'method': "POST",
					'data':data,
					'url': url,
					'onSuccess': sFun,
					'onError': fFun,
					'dataType': dataType
				});
			},
			
			/**
			 * Communicate with the server by PUT method.
			 * @param {string} url - The server url
			 * @param {object} data - The post data
			 * @param {function} sFun - Function that would be called when success.
			 * @param {function} fFun - Function that would be called when error.
			 * @param {string} dataType - The server response type expected. Could be 'json','blob','text','xml'. 
			 */
			'put': function(url, data, sFun, fFun, dataType) {
				return new io({
				    'method': "PUT",
					'data':data,
					'url': url,
					'onSuccess': sFun,
					'onError': fFun,
					'dataType': dataType
				});
			}
		}
	};
	
    lib.mix(lib, _ret);
	
})(dynamsoft.lib, dynamsoft.navInfo);

/**
 * Dynamsoft JavaScript Library
 * @product Dynamsoft Webcam SDK
 * @website http://www.dynamsoft.com
 *
 * @preserve Copyright 2017, Dynamsoft Corporation
 * @author Dynamsoft R&D Team
 *
 * @version 5.1
 *
 * @fileoverview Provide functions to convert json object to string and vice versa.
 * 1. lib.parse() - Parse a string as JSON and return the value.
 * 2. lib.stringify() - Return a JSON string corresponding to the specified value.
 */

(function (lib) {
    // json/quote
    var Quote = (function () {
        var CONTROL_MAP = {
            '\b': '\\b',
            '\f': '\\f',
            '\n': '\\n',
            '\r': '\\r',
            '\t': '\\t',
            '"': '\\"'
        },
            REVERSE_CONTROL_MAP = {},
            QUOTE_REG = /["\b\f\n\r\t\x00-\x1f]/g,
            UN_QUOTE_REG = /\\\\|\\\/|\\b|\\f|\\n|\\r|\\t|\\"|\\u[0-9a-zA-Z]{4}/g;

        lib.each(CONTROL_MAP, function (original, encoded) {
            REVERSE_CONTROL_MAP[original] = encoded;
        });

        REVERSE_CONTROL_MAP['\\/'] = '/';
        REVERSE_CONTROL_MAP['\\\\'] = '\\';

        return {
            quote: function (value) {
                return '"' + value.replace(QUOTE_REG, function (m) {
                    var v;
                    if (!(v = CONTROL_MAP[m])) {
                        v = '\\u' + ('0000' + m.charCodeAt(0).toString(16)).slice(0 - 4);
                    }
                    return v;
                }) + '"';
            },
            unQuote: function (value) {
                return value.slice(1, value.length - 1).replace(UN_QUOTE_REG, function (m) {
                    var v;
                    if (!(v = REVERSE_CONTROL_MAP[m])) {
                        v = String.fromCharCode(parseInt(m.slice(2), 16));
                    }
                    return v;
                });
            }
        };
    })();

    // json/stringify
    function padding2(n) {
        return n < 10 ? '0' + n : n;
    }

    function str(key, holder, replacerFunction, propertyList, gap, stack, indent) {
        var value = holder[key];
        if (value && typeof value === 'object') {
            if (typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            } else if (value instanceof Date) {
                value = isFinite(value.valueOf()) ?
                    value.getUTCFullYear() + '-' +
                        padding2(value.getUTCMonth() + 1) + '-' +
                        padding2(value.getUTCDate()) + 'T' +
                        padding2(value.getUTCHours()) + ':' +
                        padding2(value.getUTCMinutes()) + ':' +
                        padding2(value.getUTCSeconds()) + 'Z' : null;
            } else if (value instanceof String || value instanceof Number || value instanceof Boolean) {
                value = value.valueOf();
            }
        }
        if (replacerFunction !== undefined) {
            value = replacerFunction.call(holder, key, value);
        }

        switch (typeof value) {
            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'string':
                return Quote.quote(value);
            case 'boolean':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                if (lib.isArray(value)) {
                    return ja(value, replacerFunction, propertyList, gap, stack, indent);
                }
                return jo(value, replacerFunction, propertyList, gap, stack, indent);
                // ignore undefined
        }

        return undefined;
    }

    function jo(value, replacerFunction, propertyList, gap, stack, indent) {

        var stepBack = indent;
        indent += gap;
        var k, kl, i, p;
        if (propertyList !== undefined) {
            k = propertyList;
        } else {
            k = lib.keys(value);
        }
        var partial = [];
        for (i = 0, kl = k.length; i < kl; i++) {
            p = k[i];
            var strP = str(p, value, replacerFunction, propertyList, gap, stack, indent);
            if (strP !== undefined) {
                var member = Quote.quote(p);
                member += ':';
                if (gap) {
                    member += ' ';
                }
                member += strP;
                partial[partial.length] = member;
            }
        }
        var ret;
        if (!partial.length) {
            ret = '{}';
        } else {
            if (!gap) {
                ret = '{' + partial.join(',') + '}';
            } else {
                var separator = ",\n" + indent;
                var properties = partial.join(separator);
                ret = '{\n' + indent + properties + '\n' + stepBack + '}';
            }
        }
        return ret;
    }

    function ja(value, replacerFunction, propertyList, gap, stack, indent) {

        var stepBack = indent;
        indent += gap;
        var partial = [];
        var len = value.length;
        var index = 0;
        while (index < len) {
            var strP = str(String(index), value, replacerFunction, propertyList, gap, stack, indent);
            if (strP === undefined) {
                partial[partial.length] = 'null';
            } else {
                partial[partial.length] = strP;
            }
            ++index;
        }
        var ret;
        if (!partial.length) {
            ret = '[]';
        } else {
            if (!gap) {
                ret = '[' + partial.join(',') + ']';
            } else {
                var separator = '\n,' + indent;
                var properties = partial.join(separator);
                ret = '[\n' + indent + properties + '\n' + stepBack + ']';
            }
        }

        return ret;
    }

    lib.stringify = function (value, replacer, space) {
        var gap = '';
        var propertyList, replacerFunction;
        if (replacer) {
            if (typeof replacer === 'function') {
                replacerFunction = replacer;
            } else if (lib.isArray(replacer)) {
                propertyList = replacer;
            }
        }

        if (typeof space === 'number') {
            space = Math.min(10, space);
            gap = new Array(space + 1).join(' ');
        } else if (typeof space === 'string') {
            gap = space.slice(0, 10);
        }

        return str('', {
            '': value
        }, replacerFunction, propertyList, gap, [], '');
    };

    // json/parser
    var parser = {},
        GrammarConst = {
            'SHIFT_TYPE': 1,
            'REDUCE_TYPE': 2,
            'ACCEPT_TYPE': 0,
            'TYPE_INDEX': 0,
            'PRODUCTION_INDEX': 1,
            'TO_INDEX': 2
        },
		Lexer;

    parser.yy = {
        unQuote: Quote.unQuote
    };

    Lexer = function (cfg) {

        var self = this;

        /*
         lex rules.
         @type {Object[]}
         @example
         [
         {
         regexp:'\\w+',
         state:['xx'],
         token:'c',
         // this => lex
         action:function(){}
         }
         ]
         */
        self.rules = [];

        lib.mix(self, cfg);

        /*
         Input languages
         @type {String}
         */

        self.resetInput(self.input);

    };
    Lexer.prototype = {
        'constructor': function (cfg) {

            var self = this;

            /*
             lex rules.
             @type {Object[]}
             @example
             [
             {
             regexp:'\\w+',
             state:['xx'],
             token:'c',
             // this => lex
             action:function(){}
             }
             ]
             */
            self.rules = [];

            lib.mix(self, cfg);

            /*
             Input languages
             @type {String}
             */

            self.resetInput(self.input);

        },
        'resetInput': function (input) {
            lib.mix(this, {
                input: input,
                matched: "",
                stateStack: [Lexer.STATIC.INITIAL],
                match: "",
                text: "",
                firstLine: 1,
                lineNumber: 1,
                lastLine: 1,
                firstColumn: 1,
                lastColumn: 1
            });
        },
        'getCurrentRules': function () {
            var self = this,
                currentState = self.stateStack[self.stateStack.length - 1],
                rules = [];
            currentState = self.mapState(currentState);
            lib.each(self.rules, function (r) {
                var state = r.state || r[3];
                if (!state) {
                    if (currentState == Lexer.STATIC.INITIAL) {
                        rules.push(r);
                    }
                } else if (lib.inArray(currentState, state)) {
                    rules.push(r);
                }
            });
            return rules;
        },
        'pushState': function (state) {
            this.stateStack.push(state);
        },
        'popState': function () {
            return this.stateStack.pop();
        },
        'getStateStack': function () {
            return this.stateStack;
        },
        'showDebugInfo': function () {
            var self = this,
                DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT,
                matched = self.matched,
                match = self.match,
                input = self.input;
            matched = matched.slice(0, matched.length - match.length);
            var past = (matched.length > DEBUG_CONTEXT_LIMIT ? "..." : "") + matched.slice(-DEBUG_CONTEXT_LIMIT).replace(/\n/, " "),
                next = match + input;
            next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (next.length > DEBUG_CONTEXT_LIMIT ? "..." : "");
            return past + next + '\n' + new Array(past.length + 1).join("-") + "^";
        },
        'mapSymbol': function (t) {
            var self = this,
                symbolMap = self.symbolMap;
            if (!symbolMap) {
                return t;
            }
            return symbolMap[t] || (symbolMap[t] = (++self.symbolId));
        },
        'mapReverseSymbol': function (rs) {
            var self = this,
                symbolMap = self.symbolMap,
                i,
                reverseSymbolMap = self.reverseSymbolMap;
            if (!reverseSymbolMap && symbolMap) {
                reverseSymbolMap = self.reverseSymbolMap = {};
                for (i in symbolMap) {
                    reverseSymbolMap[symbolMap[i]] = i;
                }
            }
            if (reverseSymbolMap) {
                return reverseSymbolMap[rs];
            } else {
                return rs;
            }
        },
        'mapState': function (s) {
            var self = this,
                stateMap = self.stateMap;
            if (!stateMap) {
                return s;
            }
            return stateMap[s] || (stateMap[s] = (++self.stateId));
        },
        'lex': function () {
            var self = this,
                input = self.input,
                i,
                rule,
                m,
                ret,
                lines,
                rules = self.getCurrentRules();

            self.match = self.text = "";

            if (!input) {
                return self.mapSymbol(Lexer.STATIC.END_TAG);
            }

            for (i = 0; i < rules.length; i++) {
                rule = rules[i];
                var regexp = rule.regexp || rule[1],
                    token = rule.token || rule[0],
                    action = rule.action || rule[2] || undefined;
                if (m = input.match(regexp)) {
                    lines = m[0].match(/\n.*/g);
                    if (lines) {
                        self.lineNumber += lines.length;
                    }
                    lib.mix(self, {
                        firstLine: self.lastLine,
                        lastLine: self.lineNumber + 1,
                        firstColumn: self.lastColumn,
                        lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length
                    });
                    var match;
                    // for error report
                    match = self.match = m[0];

                    // all matches
                    self.matches = m;
                    // may change by user
                    self.text = match;
                    // matched content utils now
                    self.matched += match;
                    ret = action && action.call(self);
                    if (ret === undefined) {
                        ret = token;
                    } else {
                        ret = self.mapSymbol(ret);
                    }
                    input = input.slice(match.length);
                    self.input = input;

                    if (ret) {
                        return ret;
                    } else {
                        // ignore
                        return self.lex();
                    }
                }
            }

            lib.error("lex error at line " + self.lineNumber + ":\n" + self.showDebugInfo());
            return undefined;
        }
    };
    Lexer.STATIC = {
        'INITIAL': 'I',
        'DEBUG_CONTEXT_LIMIT': 20,
        'END_TAG': '$EOF'
    };
    var lexer = new Lexer({
        'rules': [
            [2, /^"(\\"|\\\\|\\\/|\\b|\\f|\\n|\\r|\\t|\\u[0-9a-zA-Z]{4}|[^\\"\x00-\x1f])*"/, 0],
            [0, /^[\t\r\n\x20]/, 0],
            [3, /^,/, 0],
            [4, /^:/, 0],
            [5, /^\[/, 0],
            [6, /^\]/, 0],
            [7, /^\{/, 0],
            [8, /^\}/, 0],
            [9, /^-?\d+(?:\.\d+)?(?:e-?\d+)?/i, 0],
            [10, /^true|false/, 0],
            [11, /^null/, 0],
            [12, /^./, 0]
        ]
    });
    parser.lexer = lexer;
    lexer.symbolMap = {
        '$EOF': 1,
        'STRING': 2,
        'COMMA': 3,
        'COLON': 4,
        'LEFT_BRACKET': 5,
        'RIGHT_BRACKET': 6,
        'LEFT_BRACE': 7,
        'RIGHT_BRACE': 8,
        'NUMBER': 9,
        'BOOLEAN': 10,
        'NULL': 11,
        'INVALID': 12,
        '$START': 13,
        'json': 14,
        'value': 15,
        'object': 16,
        'array': 17,
        'elementList': 18,
        'member': 19,
        'memberList': 20
    };
    parser.productions = [
        [13, [14]],
        [14, [15], function () {
            return this.$1;
        }],
        [15, [2], function () {
            return this.yy.unQuote(this.$1);
        }],
        [15, [9], function () {
            return parseFloat(this.$1);
        }],
        [15, [16], function () {
            return this.$1;
        }],
        [15, [17], function () {
            return this.$1;
        }],
        [15, [10], function () {
            return this.$1 === 'true';
        }],
        [15, [11], function () {
            return null;
        }],
        [18, [15], function () {
            return [this.$1];
        }],
        [18, [18, 3, 15], function () {
            this.$1[this.$1.length] = this.$3;
            return this.$1;
        }],
        [17, [5, 6], function () {
            return [];
        }],
        [17, [5, 18, 6], function () {
            return this.$2;
        }],
        [19, [2, 4, 15], function () {
            return {
                key: this.yy.unQuote(this.$1),
                value: this.$3
            };
        }],
        [20, [19], function () {
            var ret = {};
            ret[this.$1.key] = this.$1.value;
            return ret;
        }],
        [20, [20, 3, 19], function () {
            this.$1[this.$3.key] = this.$3.value;
            return this.$1;
        }],
        [16, [7, 8], function () {
            return {};
        }],
        [16, [7, 20, 8], function () {
            return this.$2;
        }]
    ];
    parser.table = {
        'gotos': {
            '0': {
                '14': 7,
                '15': 8,
                '16': 9,
                '17': 10
            },
            '2': {
                '15': 12,
                '16': 9,
                '17': 10,
                '18': 13
            },
            '3': {
                '19': 16,
                '20': 17
            },
            '18': {
                '15': 23,
                '16': 9,
                '17': 10
            },
            '20': {
                '15': 24,
                '16': 9,
                '17': 10
            },
            '21': {
                '19': 25
            }
        },
        'action': {
            '0': {
                '2': [1, 0, 1],
                '5': [1, 0, 2],
                '7': [1, 0, 3],
                '9': [1, 0, 4],
                '10': [1, 0, 5],
                '11': [1, 0, 6]
            },
            '1': {
                '1': [2, 2, 0],
                '3': [2, 2, 0],
                '6': [2, 2, 0],
                '8': [2, 2, 0]
            },
            '2': {
                '2': [1, 0, 1],
                '5': [1, 0, 2],
                '6': [1, 0, 11],
                '7': [1, 0, 3],
                '9': [1, 0, 4],
                '10': [1, 0, 5],
                '11': [1, 0, 6]
            },
            '3': {
                '2': [1, 0, 14],
                '8': [1, 0, 15]
            },
            '4': {
                '1': [2, 3, 0],
                '3': [2, 3, 0],
                '6': [2, 3, 0],
                '8': [2, 3, 0]
            },
            '5': {
                '1': [2, 6, 0],
                '3': [2, 6, 0],
                '6': [2, 6, 0],
                '8': [2, 6, 0]
            },
            '6': {
                '1': [2, 7, 0],
                '3': [2, 7, 0],
                '6': [2, 7, 0],
                '8': [2, 7, 0]
            },
            '7': {
                '1': [0, 0, 0]
            },
            '8': {
                '1': [2, 1, 0]
            },
            '9': {
                '1': [2, 4, 0],
                '3': [2, 4, 0],
                '6': [2, 4, 0],
                '8': [2, 4, 0]
            },
            '10': {
                '1': [2, 5, 0],
                '3': [2, 5, 0],
                '6': [2, 5, 0],
                '8': [2, 5, 0]
            },
            '11': {
                '1': [2, 10, 0],
                '3': [2, 10, 0],
                '6': [2, 10, 0],
                '8': [2, 10, 0]
            },
            '12': {
                '3': [2, 8, 0],
                '6': [2, 8, 0]
            },
            '13': {
                '3': [1, 0, 18],
                '6': [1, 0, 19]
            },
            '14': {
                '4': [1, 0, 20]
            },
            '15': {
                '1': [2, 15, 0],
                '3': [2, 15, 0],
                '6': [2, 15, 0],
                '8': [2, 15, 0]
            },
            '16': {
                '3': [2, 13, 0],
                '8': [2, 13, 0]
            },
            '17': {
                '3': [1, 0, 21],
                '8': [1, 0, 22]
            },
            '18': {
                '2': [1, 0, 1],
                '5': [1, 0, 2],
                '7': [1, 0, 3],
                '9': [1, 0, 4],
                '10': [1, 0, 5],
                '11': [1, 0, 6]
            },
            '19': {
                '1': [2, 11, 0],
                '3': [2, 11, 0],
                '6': [2, 11, 0],
                '8': [2, 11, 0]
            },
            '20': {
                '2': [1, 0, 1],
                '5': [1, 0, 2],
                '7': [1, 0, 3],
                '9': [1, 0, 4],
                '10': [1, 0, 5],
                '11': [1, 0, 6]
            },
            '21': {
                '2': [1, 0, 14]
            },
            '22': {
                '1': [2, 16, 0],
                '3': [2, 16, 0],
                '6': [2, 16, 0],
                '8': [2, 16, 0]
            },
            '23': {
                '3': [2, 9, 0],
                '6': [2, 9, 0]
            },
            '24': {
                '3': [2, 12, 0],
                '8': [2, 12, 0]
            },
            '25': {
                '3': [2, 14, 0],
                '8': [2, 14, 0]
            }
        }
    };
    parser.parse = function parse(input) {

        var self = this,
            lexer = self.lexer,
            state,
            symbol,
            action,
            table = self.table,
            gotos = table.gotos,
            tableAction = table.action,
            productions = self.productions,
            valueStack = [null],
            stack = [0];

        lexer.resetInput(input);

        while (1) {
            // retrieve state number from top of stack
            state = stack[stack.length - 1];

            if (!symbol) {
                symbol = lexer.lex();
            }

            if (!symbol) {
                lib.log("it is not a valid input: " + input, "error");
                return false;
            }

            // read action for current state and first input
            action = tableAction[state] && tableAction[state][symbol];

            if (!action) {
                var expected = [],
                    error;
                if (tableAction[state]) {
                    lib.each(tableAction[state], function (_, symbol) {
                        expected.push(self.lexer.mapReverseSymbol(symbol));
                    });
                }
                error = "Syntax error at line " + lexer.lineNumber + ":\n" + lexer.showDebugInfo() + '\n' + "expect " + expected.join(", ");
                lib.log(error);
                return false;
            }

            switch (action[GrammarConst.TYPE_INDEX]) {

                case GrammarConst.SHIFT_TYPE:

                    stack.push(symbol);

                    valueStack.push(lexer.text);

                    // push state
                    stack.push(action[GrammarConst.TO_INDEX]);

                    // allow to read more
                    symbol = null;

                    break;

                case GrammarConst.REDUCE_TYPE:

                    var production = productions[action[GrammarConst.PRODUCTION_INDEX]],
                        reducedSymbol = production.symbol || production[0],
                        reducedAction = production.action || production[2],
                        reducedRhs = production.rhs || production[1],
                        len = reducedRhs.length,
                        i = 0,
                        ret,
                        $$ = valueStack[valueStack.length - len]; // default to $$ = $1

                    self.$$ = $$;

                    ret = undefined;

                    for (; i < len; i++) {
                        self["$" + (len - i)] = valueStack[valueStack.length - 1 - i];
                    }

                    if (reducedAction) {
                        ret = reducedAction.call(self);
                    }

                    if (ret !== undefined) {
                        $$ = ret;
                    } else {
                        $$ = self.$$;
                    }

                    if (len) {
                        stack = stack.slice(0, -1 * len * 2);
                        valueStack = valueStack.slice(0, -1 * len);
                    }

                    stack.push(reducedSymbol);

                    valueStack.push($$);

                    var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];

                    stack.push(newState);

                    break;

                case GrammarConst.ACCEPT_TYPE:

                    return $$;
            }

        }

        return undefined;

    };

    lib.parser = parser;

    // json/parse
    function walk(holder, name, reviver) {
        var val = holder[name],
            i, len, newElement;

        if (typeof val === 'object') {
            if (lib.isArray(val)) {
                i = 0;
                len = val.length;
                var newVal = [];
                while (i < len) {
                    newElement = walk(val, String(i), reviver);
                    if (newElement !== undefined) {
                        newVal[newVal.length] = newElement;
                    }
                }
                val = newVal;
            } else {
                var keys = lib.keys(val);
                for (i = 0, len = keys.length; i < len; i++) {
                    var p = keys[i];
                    newElement = walk(val, p, reviver);
                    if (newElement === undefined) {
                        delete val[p];
                    } else {
                        val[p] = newElement;
                    }
                }
            }
        }

        return reviver.call(holder, name, val);
    }

    lib.parse = function (str, reviver) {
		var win=window, _json=win['JSON'];
		
		if(_json && _json['parse'])
		{
			return _json['parse'](String(str));
		}
		
        var root = parser.parse(String(str));
        if (reviver) {
            return walk({
                '': root
            }, '', reviver);
        } else {
            return root;
        }
    };

})(dynamsoft.lib);

(function (lib,navInfo) {

	var win=window,
		doc=document,
		TRUE=!0,
		FALSE=!1,
		dialogPolyfill = {}, 
		bIE6Or7 = (navInfo.bIE && navInfo.IEMode < 8),
		bIE6 = bIE6Or7 && (navInfo.IEMode < 7),
		
		// The overlay is used to simulate how a modal dialog blocks the document. The
		// blocking dialog is positioned on top of the overlay, and the rest of the
		// dialogs on the pending dialog stack are positioned below it. In the actual
		// implementation, the modal dialog stacking is controlled by the top layer,
		// where z-index has no effect.
		TOP_LAYER_ZINDEX = 5e5,
		MAX_PENDING_DIALOGS = 1e3,

      _reposition = function (element) {
        var scrollTop, topValue, innerHeight;
		
		scrollTop = doc.body.scrollTop || doc.documentElement.scrollTop;
		
		if(win.innerHeight)
			innerHeight = win.innerHeight;
		else
			innerHeight = doc.documentElement.clientHeight;
		
        topValue = scrollTop + (innerHeight - element.offsetHeight) / 2;
		
        element.style.top = topValue + 'px';
        element._dlgInfo.isTopOverridden = TRUE;
      },

	  _inNodeList = function (nodeList, node) {
		for (var i = 0; i < nodeList.length; ++i) {
			if (nodeList[i] == node)
				return TRUE;
		}
		return FALSE;
	  },

	  isInlinePositionSetByStylesheet = function (element) {
        for (var i = 0; i < doc.styleSheets.length; ++i) {
            var styleSheet = doc.styleSheets[i],
				cssRules = FALSE,
				querySelectorAll = FALSE,
				rule, selectedNodes;
				
            // Some browsers throw on cssRules.
            try {
                cssRules = styleSheet.cssRules;
				querySelectorAll = doc.querySelectorAll;
            } catch (e) { }
			
            if (cssRules && querySelectorAll)
              for (var j = 0; j < cssRules.length; ++j) {
                rule = cssRules[j];
				selectedNodes = FALSE;
					
                // Ignore errors on invalid selector texts.
                try {
					selectedNodes = querySelectorAll(rule.selectorText);
                } catch (e) { }

                if (selectedNodes && _inNodeList(selectedNodes, element))
				{
					var cssTop = rule.style.getPropertyValue('top'),
						cssBottom = rule.style.getPropertyValue('bottom');

					if ((cssTop && cssTop != 'auto') || (cssBottom && cssBottom != 'auto'))
						return TRUE;
				}					
              }
        }
        return FALSE;
      },

      _needsCentering = function (dialog) {
		
        var computedStyle = FALSE;
		
		if(win.getComputedStyle) {
			//FF / Chrome / Safari / IE9+
			computedStyle = win.getComputedStyle(dialog);
		} else if(dialog.currentStyle) {
			// IE8
			computedStyle = dialog.currentStyle;
		}
		
        if (computedStyle && computedStyle.position != 'absolute')
            return FALSE;

        // We must determine whether the top/bottom specified value is non-auto.  In
        // WebKit/Blink, checking computedStyle.top == 'auto' is sufficient, but
        // Firefox returns the used value. So we do this crazy thing instead: check
        // the inline style and then go through CSS rules.
        if ((dialog.style.top != 'auto' && dialog.style.top != '') ||
            (dialog.style.bottom != 'auto' && dialog.style.bottom != ''))
            return FALSE;
        return !isInlinePositionSetByStylesheet(dialog);
      };

    dialogPolyfill.showDialog = function (isModal) {
		var _this=this,vp;
		
        if (_this.open) {
            // throw 'InvalidStateError: showDialog called on open dialog';
			lib.error('showDialog called on open dialog.');
			return;
        }
        _this.open = TRUE;
        _this.setAttribute('open', 'open');
		
		if(bIE6Or7)
		{
			vp = bIE6 ? doc.body : doc.documentElement;
			_this._dlgInfo.docOverflow = vp.style.overflow;
			vp.style.overflow = 'hidden';
		}

        if (_needsCentering(_this))
            _reposition(_this);
		
        if (isModal) {
            _this._dlgInfo.modal = TRUE;
            dialogPolyfill.dm.pushDialog(_this);

			if(bIE6Or7){
				var _initLeft, _initTop, _srcLeft=FALSE, _srcTop=FALSE;
				
				_initLeft = _this.currentStyle.left;
				_initTop = _this.currentStyle.top;
				
				if(_initLeft === 'auto')
				{
					if(bIE6)
						_this.style.textAlign = 'center';
					_initLeft = (vp.clientWidth - _this.currentStyle.width) / 2.0;
				} 
				else if(_initLeft.indexOf('%')>0)
				{
					_srcLeft=_initLeft;
					_initLeft = Number(_initLeft.replace("%","") * vp.clientWidth / 100.0);
				}
				else
				{
					_initLeft = Number(_initLeft.replace("px",""));
				}
				// NaN or <=0
				if(!(_initLeft>0))
					_initLeft=0;
				
				if(_initTop === 'auto')
				{
					_initTop = (vp.clientHeight - _this.currentStyle.height) / 2.0;
				}
				else if(_initTop.indexOf('%')>0)
				{
					_srcTop=_initTop;
					_initTop = Number(_initTop.replace("%","") * vp.clientHeight / 100.0);
				}
				else
				{
					_initTop = Number(_initTop.replace("px",""));
				}
				
				// NaN or <=0
				if(!(_initTop>0))
					_initTop=0;
				
				setTimeout(function(){
					var elStyle = _this.style,
						mask = _this._dlgInfo.mask;
					
					mask.style.backgroundColor = '#000';
					mask.style.filter = 'alpha(opacity=30)';
					
					elStyle.position = 'absolute';
					elStyle.left = _initLeft + 'px';
					elStyle.top = _initTop + 'px';
				},0);
				
				_this._scrollFn = function() {
						var _maskTop=vp.scrollTop+"px",
							_maskLeft=vp.scrollLeft+"px",
							elOverlay= dialogPolyfill.dm.overlay,
							mask = _this._dlgInfo.mask,
							_elStyle = _this.style;
						
						
						if((_initTop+vp.scrollTop+vp.clientHeight)<vp.scrollHeight)
							_elStyle.top = _initTop+vp.scrollTop+"px";
						else
							_elStyle.top = _maskTop;

						if(elOverlay)
							elOverlay.style.top = _maskTop;
						if(mask)
							mask.style.top = _maskTop;
						
						_elStyle.left = _maskLeft;
						if(elOverlay)
							elOverlay.style.left = _maskLeft;
						if(mask)
							mask.style.left = _maskLeft;
						
						setTimeout(function(){_this._resizeFn();}, 100);
					};
				_this._resizeFn = function(){
						var _vp = bIE6 ? doc.body : doc.documentElement,
							w=_vp.clientWidth+"px",
							h=_vp.clientHeight+"px",
							elOverlay=dialogPolyfill.dm.overlay,
							mask = _this._dlgInfo.mask;
						
						elOverlay.style.width = w;
						if(mask)
							mask.style.width = w;
						
						elOverlay.style.height = h;
						if(mask)
							mask.style.height = h;
						
						setTimeout(function(){
							var _left, _top, 
								_style=_this.style,
								__vp = bIE6 ? doc.body : doc.documentElement;
							
							if(_srcLeft){
								_left = Number(_srcLeft.replace("%","") * __vp.clientWidth / 100.0);
								_style.left = _left + 'px';
							}
							
							if(_srcTop){
								_top = Number(_srcTop.replace("%","") * __vp.clientHeight / 100.0);	
								_style.top = _top + 'px';
							}
						
						},0);
					};
				_this._scrollFn();
				win.attachEvent("onscroll", _this._scrollFn);
				win.attachEvent("onresize", _this._resizeFn);
			}
        }
    };


    dialogPolyfill.closeDialog = function (retval) {
		var _this=this;
		
        if (!_this.open){
			lib.error('closeDialog called on closed dialog.');
		}

        _this.open = FALSE;
        _this.removeAttribute('open');
		
		if(bIE6Or7){
			var vp = bIE6 ? doc.body : doc.documentElement;
			vp.style.overflow = _this._dlgInfo.docOverflow;
		}

        // Leave returnValue untouched in case it was set directly on the element
        if (typeof retval != 'undefined') {
            _this.returnValue = retval;
        }

        // This won't match the native <dialog> exactly because if the user sets top
        // on a centered polyfill dialog, that top gets thrown away when the dialog is
        // closed. Not sure it's possible to polyfill this perfectly.
        if (_this._dlgInfo.isTopOverridden) {
            _this.style.top = 'auto';
        }

        if (_this._dlgInfo.modal) {

			if(bIE6Or7){
				win.detachEvent("onscroll", _this._scrollFn);
				win.detachEvent("onresize", _this._resizeFn);
			}
            dialogPolyfill.dm.removeDialog(this);
        }
        // Triggering "close" event for any attached listeners on the <dialog>
        //lib.fireEvent('close', this);

        return _this.returnValue;
    };

    dialogPolyfill.createMouseEvent = function (e) {
		var ret = doc.createEvent('MouseEvents');
		ret.initMouseEvent(e.type, e.bubbles, e.cancelable, win,
			e.detail, e.screenX, e.screenY, e.clientX, e.clientY, e.ctrlKey,
			e.altKey, e.shiftKey, e.metaKey, e.button, e.relatedTarget);
		return ret;
	};
	
    dialogPolyfill.setup = function (el) {
		var _this=this;
        el.show = _this.showDialog.bind(el, FALSE);
        el.showModal = _this.showDialog.bind(el, TRUE);
        el.close = _this.closeDialog.bind(el);
        el._dlgInfo = {};
    };



    var DialogManager = function () {
		var _this=this, _overlay_style;
		
        _this.pendingDialogStack = [];
		
		_this.overlay = doc.createElement(bIE6Or7 ? 'iframe' : 'div');
        _overlay_style = _this.overlay.style;
		_overlay_style.position = bIE6Or7 ? 'absolute' : 'fixed';
		
		_overlay_style.display = 'block';
        _overlay_style.left = _overlay_style.top = _overlay_style.margin = _overlay_style.padding = 0;
		
        _overlay_style.backgroundColor = '#000';
		_overlay_style.filter = 'alpha(opacity=30)';
        _overlay_style.opacity = _overlay_style.MozOpacity = 0.3;
		_overlay_style.zIndex = TOP_LAYER_ZINDEX;

        _overlay_style.width = '100%';
		if(bIE6Or7 && doc.documentElement.clientHeight>0){
			// ie6
			_overlay_style.height = doc.documentElement.clientHeight + 'px';
		} else {
			_overlay_style.height = '100%';
		}
		
		if(doc.createEvent){
			lib.addEventListener(_this.overlay, 'click', function (e) {
				var redirectedEvent = dialogPolyfill.createMouseEvent(e);
				doc.body.dispatchEvent(redirectedEvent);
			});
		}
    },
	DMP = DialogManager.prototype;

    DMP._blockDocument = function () {
        if (!doc.body.contains(this.overlay))
            doc.body.appendChild(this.overlay);
    };

    DMP._unblockDocument = function () {
        doc.body.removeChild(this.overlay);
    };

    DMP._updateStacking = function () {
        var _this=this, mask, _stack, i, zIndex;

		_stack=_this.pendingDialogStack;
        if (_stack.length == 0) {
            _this._unblockDocument();
            return;
        }
        _this._blockDocument();

        zIndex = TOP_LAYER_ZINDEX;
		lib.each(_stack,function(item){
			zIndex++;
            item._dlgInfo.mask.style.zIndex = zIndex++;
            item.style.zIndex = zIndex;
		});
    };

    DMP.pushDialog = function (dialog) {
        var _this=this, mask;

		if (_this.pendingDialogStack.length >= MAX_PENDING_DIALOGS) {
            lib.error("Too many modal dialogs.");
			return;
        }

        mask = doc.createElement('div');
        mask.className='dynamsoft-backdrop';
		if(bIE6Or7)
			mask.style.position = 'absolute';
		
		if(doc.createEvent){
			lib.addEventListener(mask, 'click', function (e) {
				if(dialog.dispatchEvent){
					var redirectedEvent = dialogPolyfill.createMouseEvent(e);
					dialog.dispatchEvent(redirectedEvent);	
				}
			});
		}
        dialog.parentNode.insertBefore(mask, dialog.nextSibling);
        dialog._dlgInfo.mask = mask;
        _this.pendingDialogStack.push(dialog);
        _this._updateStacking();
    };

    DMP.removeDialog = function (dialog) {
		
        var _this=this, index, mask;
		
        //index = lib.indexOf(dialog, _this.pendingDialogStack);

        index = lib.isArray(_this.pendingDialogStack) ?
            _this.pendingDialogStack.indexOf(dialog) :
            -1;

        if (index == -1)
            return;
        _this.pendingDialogStack.splice(index, 1);
        
		mask = dialog._dlgInfo.mask;
        mask.parentNode.removeChild(mask);
        dialog._dlgInfo.mask = null;
        _this._updateStacking();
    };


	dialogPolyfill.dm = new DialogManager();

    lib.dialog = dialogPolyfill;
})(dynamsoft.lib, dynamsoft.navInfo);

dynamsoft.lib.BASE64 = (function(){
  var lookup = [];
  var revLookup = [];
  var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i]
    revLookup[code.charCodeAt(i)] = i
  }

  revLookup['-'.charCodeAt(0)] = 62
  revLookup['_'.charCodeAt(0)] = 63

  function placeHoldersCount (b64) {
    var len = b64.length
    if (len % 4 > 0) {
      throw new Error('Invalid string. Length must be a multiple of 4')
    }

    // the number of equal signs (place holders)
    // if there are two placeholders, than the two characters before it
    // represent one byte
    // if there is only one, then the three characters before it represent 2 bytes
    // this is just a cheap hack to not do indexOf twice
    return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
  }

  function byteLength (b64) {
    // base64 is 4/3 + up to two characters of the original data
    return (b64.length * 3 / 4) - placeHoldersCount(b64)
  }

  function toByteArray (b64) {
    var i, j, l, tmp, placeHolders, arr
    var len = b64.length
    placeHolders = placeHoldersCount(b64)

    arr = new Arr((len * 3 / 4) - placeHolders)

    // if there are placeholders, only get up to the last complete 4 chars
    l = placeHolders > 0 ? len - 4 : len

    var L = 0

    for (i = 0, j = 0; i < l; i += 4, j += 3) {
      tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
      arr[L++] = (tmp >> 16) & 0xFF
      arr[L++] = (tmp >> 8) & 0xFF
      arr[L++] = tmp & 0xFF
    }

    if (placeHolders === 2) {
      tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
      arr[L++] = tmp & 0xFF
    } else if (placeHolders === 1) {
      tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
      arr[L++] = (tmp >> 8) & 0xFF
      arr[L++] = tmp & 0xFF
    }

    return arr
  }

  function tripletToBase64 (num) {
    return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
  }

  function encodeChunk (uint8, start, end) {
    var tmp
    var output = []
    for (var i = start; i < end; i += 3) {
      tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
      output.push(tripletToBase64(tmp))
    }
    return output.join('')
  }

  function fromByteArray (uint8) {
    var tmp
    var len = uint8.length
    var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
    var output = ''
    var parts = []
    var maxChunkLength = 16383 // must be multiple of 3

    // go through the array every three bytes, we'll deal with trailing stuff later
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
    }

    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
      tmp = uint8[len - 1]
      output += lookup[tmp >> 2]
      output += lookup[(tmp << 4) & 0x3F]
      output += '=='
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
      output += lookup[tmp >> 10]
      output += lookup[(tmp >> 4) & 0x3F]
      output += lookup[(tmp << 2) & 0x3F]
      output += '='
    }

    parts.push(output)

    return parts.join('')
  }
  this.byteLength = byteLength;
  this.toByteArray = toByteArray;
  this.fromByteArray = fromByteArray;
  return this;
})();
(function(lib){
	
	// POST http://127.0.0.1:18625/dcp/dwasm_13000410/VersionInfo?xxx
	// Content-Data {"id":"1","method":"VersionInfo","parameter":[]}
	if(dynamsoft.dcpV2)
		return;
	
	var navInfo=dynamsoft.navInfo,
		dcpV2,
		detect={
			bConnected: false,
			curPortIndex:0,
			bTrial:true,
			bConnectNumLimited: true,
			IMAXCONNECTCOUNT: 2
		};
	dynamsoft.dcpV2 = dcpV2 = {
		'ip': '127.0.0.1',
		'ports': [[18625,18626],[18993,18994]],
		'sdkVersion': [13,0,0,'0404'],
		'detect': detect,
		'versionInfo': function (callback) {
			var iConnectCount = 0,
				funcConnectServer = function (onSuccess, onError) {
					var _url = [
							dcpV2._getPreUrl(detect.curPortIndex),
							dcpV2._getModuleName(),
							dcpV2._getModuleVer(),
							'/VersionInfo?ts=', lib.now()
						].join(''),
						d = lib.stringify({"id":"1","method":"VersionInfo","version":'dwasm_'+dcpV2.sdkVersion.join(''),"parameter":[]});

					lib.ajax({
						'method':'POST',
						'url':_url,
						'data':d,
						'onSuccess':onSuccess,
						'onError':onError
					});	
				},
				fCallback = function (responseData, statusText, wrapedXhr) {
					++iConnectCount;
					detect.curPortIndex = iConnectCount % dcpV2.ports.length;
					detect.bConnected = false;
					if (detect.bConnectNumLimited && iConnectCount >= detect.IMAXCONNECTCOUNT) {
					    if (lib.isFunction(callback)) {
					        setTimeout(function() {
					                callback(responseData, statusText, wrapedXhr);
					            },0);
					    }
					    return;
					}

					setTimeout(function(){
						funcConnectServer(sCallback, fCallback);
					}, 1000);
				},
				sCallback = function (responseData, statusText, wrapedXhr) {
					var r = dcpV2._getJSON(responseData);
					
					if (r && 'result' in r){
						r=r.result;
						if(lib.isArray(r) && r.length>1 && r[0] && r[1]) {
							var aryServiceVersion = r[0].split(','),
							strProduct = r[1].toLowerCase();

							if (dcpV2._isCompitable(aryServiceVersion,dcpV2.sdkVersion)) {
								detect.bTrial = strProduct.indexOf('trial')>=0;
								detect.curPort = dcpV2.ports[iConnectCount % dcpV2.ports.length];
								detect.bConnected = true;

								if (lib.isFunction(callback)) {
									setTimeout(function(){callback(responseData, statusText, wrapedXhr);}, 0);
									return;
								}
							}
						}
					}
					
					setTimeout(fCallback, 1000);
				};

			funcConnectServer(sCallback, fCallback);
		},
		loadZip: function(blob, type, sFun, fFun){
			var _url = [
							dcpV2._getPreUrl(detect.curPortIndex),
							dcpV2._getModuleName(),
							dcpV2._getModuleVer(),
							'/LoadZipFromBytes?ts=', lib.now()
						].join('');

			/*
			var xhr = new XMLHttpRequest();
			xhr.open('POST', _url, true);
			xhr.overrideMimeType('text/plain; charset=x-user-defined');
			xhr.send(blob);*/
			
			new lib.ajax({
				method: 'POST',
				url: _url,
				async: true,
				data: blob,
				mimeType:'text/plain; charset=x-user-defined',
				onSuccess: function(_data, statusStr, wrapedXhr){
					try{
						resObj = lib.parse(_data);
						if(resObj.result[0] == true){
							sFun(resObj, statusStr, wrapedXhr);
						}else{
							throw "";
						}
					}catch(e){
						fFun(_data, statusStr, wrapedXhr);
					}
				},
				onError: fFun
			});
		},
		_getPreUrl: function(n){
			var port, protocol;
			if(navInfo.bSSL){
				protocol='https://';
				port=dcpV2.ports[n][1];
			} else {
				protocol='http://';
				port=dcpV2.ports[n][0];
			}
				
			return [ protocol, dcpV2.ip, ':', port, '/'].join('');
		},
		_isCompitable: function(a,b)
		{
			return (a.length>3 && a[0]==b[0] && a[1]==b[1]);
		},
		_getJSON: function(r)
		{
			return r ? lib.parse(r) : !1;
		},
		_getModuleName: function(){
			return 'dcp/dwasm_';
		},
		_getModuleVer: function()
		{
			return dcpV2.sdkVersion.join('');
		}
	};

})(dynamsoft.lib);var dynamsoft = dynamsoft || {};

dynamsoft.dbrEnv = dynamsoft.dbrEnv || {};

// hide those setting from config

dynamsoft.dbrEnv.version = '5.1.0.0404';
dynamsoft.dbrEnv.versionInfo = 'JS version: 5.1.0.0404, Dll version: null';

dynamsoft.dbrEnv.port = [18625, 18993];
dynamsoft.dbrEnv.portSSL = [18626, 18994];

dynamsoft.dbrEnv.ifShowLoadingImg = true;

// max connect dwas times, default Infinity
dynamsoft.dbrEnv.maxInitConnDwasTimes = Infinity;
// dbr module max connect times, default 20(s)
dynamsoft.dbrEnv.maxInitConnDbrTimes = 20;

dynamsoft.dbrEnv.ifShowDialogWhenModuleLoadFail = false;
dynamsoft.dbrEnv.ifShowLogWhenConnSuccess = false;

dynamsoft.dbrEnv.ifThrowException = false;

// set if auto init, if you want use onSuccess or onError, set it false and init manually
dynamsoft.dbrEnv.isAutoInit = false;

// dwas quick task timeout, default 0.8(s)
dynamsoft.dbrEnv.qTaskTimeout = 0.8;
// dwas continuing connect interval, default 1000(ms), must larger than qTaskTimeout
dynamsoft.dbrEnv.continConnInterval = 1000;
/**
* function _download
*/
(function(env, lib){
	if(env._innerDLLoaded){
		return;
	}

	// innner download for compatible, espically ie6
	env._download = function (url, async, sFun, fFun, userProgressFun) {
        var preProgressPercentage = -1,
            progressFun = async && lib.isFunction(userProgressFun) ? function(ev, xhr) {
                var p = (ev.total === 0) ? 100 : Math.round(ev.loaded * 100 / ev.total),
                    ret;

                if (preProgressPercentage !== p) {
                    ret = userProgressFun(p);
                }

                preProgressPercentage = p;

                if (ret === true) {
                    xhr.abort();
                }
            } : false,

            beforeSendFun = async && lib.isFunction(userProgressFun) ?
                function(xhr, wrapper) {
                    if (!xhr ||
                        dynamsoft.navInfo.bIE && parseInt(dynamsoft.navInfo.strBrowserVersion) <= 9) return;

                    lib.addEventListener(xhr, 'progress', function(evt) {
                        delete (evt['totalSize']);
                        delete (evt['position']);

                        progressFun(evt, xhr);
                    });
                } : !1,
            cfg = {
                'beforeSend': beforeSendFun,
                'method': 'GET',
                'url': url,
                'dataType': 'blob',
                'onSuccess': sFun,
                'onError': fFun,
                'async': async
            };
        
        if (async) {
            if (dynamsoft.navInfo.bIE && parseInt(dynamsoft.navInfo.strBrowserVersion) < 10) {
                cfg.contentType = 'text/plain; charset=x-user-defined';
                cfg.mimeType = 'text/plain; charset=x-user-defined';
                cfg.headers = { 'Accept-Charset': 'x-user-defined' };
            } else {
                cfg.xhrFields = { 'responseType': dynamsoft.navInfo.bSafari ? 'arraybuffer' : 'blob' };
                cfg.onError = function (responseData, statusText, xhrWrapper) {
                    if (dynamsoft.navInfo.bSafari) {
                        var tempString;

                        try {
                            tempString = String.fromCharCode.apply(null, new Uint8Array(responseData));
                        } catch (ex) {
                            tempString = '';
                        }

                        fFun(tempString, statusText, xhrWrapper);
                    } else {
                        var reader = new window.FileReader();
                        try {
                            reader.readAsText(responseData);
                        } catch (readerEx) {
                            fFun('', statusText, xhrWrapper);
                        }

                        reader.onloadend = function () {
                            var res = reader.result;

                            fFun(res, statusText, xhrWrapper);
                        }
                    }
                };
            }
        } else {
            if (dynamsoft.navInfo.bIE && dynamsoft.navInfo.bHTML5Edition && window.Uint8Array) {
                cfg.xhrFields = { 'responseType': 'arraybuffer' };
                cfg.onSuccess = function(responseData, statusText, xhrWrapper) {
                    var arr = null;

                    if (responseData) {
                        arr = new Uint8Array(responseData);
                    }

                    sFun(arr, statusText, xhrWrapper);
                };
                cfg.onError = function(responseData, statusText, xhrWrapper) {
                    var tempString;

                    try {
                        tempString = String.fromCharCode.apply(null, new Uint8Array(responseData));
                    } catch (ex) {
                        tempString = '';
                    }
                    
                    fFun(tempString, statusText, xhrWrapper);
                };
            } else {
                cfg.contentType = 'text/plain; charset=x-user-defined';
                cfg.mimeType = 'text/plain; charset=x-user-defined';

                if (dynamsoft.navInfo.bIE && parseInt(dynamsoft.navInfo.strBrowserVersion) < 10) {
                    cfg.headers = { 'Accept-Charset': 'x-user-defined' };
                }
                
                cfg.onSuccess = function (responseData, statusText, xhrWrapper) {
                    var data, l, arr;

                    if (dynamsoft.navInfo.bIE) {
                        arr = xhrWrapper.nativeXhr.responseBody;
                    } else {
                        data = xhrWrapper.nativeXhr.responseText;
                        l = data.length;
                        arr = new Uint8Array(l);

                        for (var i = 0; i < l; i++) {
                            arr[i] = data.charCodeAt(i);
                        }
                    }

                    sFun(dynamsoft.navInfo.bSafari ? arr.buffer : arr, statusText, xhrWrapper);
                };
            }
        }

        lib.ajax(cfg);
    };
    //testDownload = _download;

	env._innerDLLoaded = true;
})(dynamsoft.dbrEnv, dynamsoft.lib);
/**
* Enums
*/
(function(env, lib){
	if(env._errorLoaded){
		return;
	}

	env.EnumDBRErrorCode = {
	    OK: 0,                                                                /*Successful.*/
	    ParameterNumberUnmatched: -1001,            /*One or more parameters are missing.*/
	    TypeNotValid: -1002,                                    /*The type of parameter [parameter name] is invalid.*/
	    ValueOutOfRange: -1003,                                /*The value of parameter [parameter name] is out of range.*/
	    ValueNotValid: -1008,                                    /*The value of parameter [parameter name] is invalid.*/
	    HttpError: -1012,                                            /*The server returned the error code [HTTP_status_codes].*/
	    LicenseDomainInvalid: -1015,                    /*The domain of your current site does not match the domain bound in the current product key, please contact the site administrator.*/        
	    ConvertBase64Failed: -1028,                            /*The conversion to base64 string failed.*/
	    JsonParseFailed: -1029,
	    
	    ConnectDwasFailed: -4000,                /*Failed to connect to the Dwas service. Please check the network connection and try again later.*/
	    DownloadDBRModuleFailed: -4001,                /*Failed to download the DBR module. Please check the network connection and try again later.*/
	    SendDBRModuleFailed: -4002,                        /*Failed to send the DBR module to Dynamsoft Service. Please check the network connection and try again later.*/
	    ConnectDBRModuleFailed: -4003,                /*Failed to connect to the DBR module. Please check the network connection and try again later.*/
	            
        Unknown: -10000,                                            /*Unknown error.*/
        NoMemory: -10001,                                            /*Not enough memory*/
        NullReference: -10002,                                /*The object isn't set to an instance.*/        
		//LicenseInvalid : -10003,
        LicenseExpired: -10004,                                /*License is expired.*/
        FileTypeNotSupported: -10006,                    /*The file type to decode is not supported.*/
        IndexInvalid: -10008,                                    /*Index is invalid.*/
        BarcodeFormatInvalid: -10009,                                    /*-10009,Barcode format is invalid.*/
        CustomedRegionInvalid: -10010,                                /*-10010,Barcode custom region to decode is invalid.*/
        MaxBarcodeNumberInvalid: -10011,                            /*-10011,The maximum barcode number is invalid.*/
        ImageReadFailed: -10012,                            /*Read image fails.*/
        TiffReadFailed: -10013,                                /*Read TIFF type image fails.*/
        LicenseQRInvalid: -10016,                            /*You do not have a valid QR Barcode license.*/
        License1DInvalid: -10017,                            /*You do not have a valid 1D Barcode license.*/
        LicensePDF417Invalid:-10019,                    /*You do not have a valid PDF417 barcode license.*/
        LicenseDataMatrixInvalid: -10020,                            /*-10020,You do not have a valid DATAMATRIX barcode license.*/
        DIBBufferInvalid: -10018,                                            /*-10018,Invalid DIB Buffer.*/
        PageNumberInvalid: -10023,                                        /* -10023,The page number is invalid.*/
        RecognitionTimeout: -10026,						/* -10026, Recognition timeout. */
        ServiceInternalError: -20000
	};

	env._DBRErrorStr = {};

	var EmErr = env.EnumDBRErrorCode;
	var ErrStr = env._DBRErrorStr;
	
	ErrStr[EmErr.OK] = "Successful.";
	ErrStr[EmErr.ParameterNumberUnmatched] = "One or more parameters are missing.";
	ErrStr[EmErr.TypeNotValid] = "The type of parameter {0} is invalid.";
	ErrStr[EmErr.ValueOutOfRange] = "The value of parameter {0} is out of range.";
	ErrStr[EmErr.ValueNotValid] = "The value of parameter {0} is invalid.";
	ErrStr[EmErr.HttpError] = "The server returned the error code {0}.";
	ErrStr[EmErr.LicenseDomainInvalid] = "The domain of your current site does not match the domain bound in the current product key, please contact the site administrator.";
	ErrStr[EmErr.ConvertBase64Failed] = "The conversion to base64 string failed.";
	ErrStr[EmErr.JsonParseFailed] = "Failed to parse json string.";
	ErrStr[EmErr.ConnectDwasFailed] = "Failed to connect to the Dwas service. Please check the network connection and try again later.";
	ErrStr[EmErr.DownloadDBRModuleFailed] = "Failed to download the DBR module. Please check the network connection and try again later.";
	ErrStr[EmErr.SendDBRModuleFailed] = "Failed to send the DBR module to Dynamsoft Service. Please check the network connection and try again later.";
	ErrStr[EmErr.ConnectDBRModuleFailed] = "Failed to connect to the DBR module. Please check the network connection and try again later.";
	ErrStr[EmErr.Unknown] = "Unknown error.";
	ErrStr[EmErr.NoMemory] = "Not enough memory.";
	ErrStr[EmErr.NullReference] = "The object isn't set to an instance.";
	ErrStr[EmErr.LicenseExpired] = "License is expired.";
	ErrStr[EmErr.FileTypeNotSupported] = "The file type to decode is not supported.";
	ErrStr[EmErr.IndexInvalid] = "Index is invalid.";
	ErrStr[EmErr.BarcodeFormatInvalid] = "Barcode format is invalid.";
	ErrStr[EmErr.CustomedRegionInvalid] = "Barcode custom region to decode is invalid.";
	ErrStr[EmErr.MaxBarcodeNumberInvalid] = "The maximum barcode number is invalid.";
	ErrStr[EmErr.ImageReadFailed] = "Read image fails.";
	ErrStr[EmErr.TiffReadFailed] = "Read TIFF type image fails.";
	ErrStr[EmErr.LicenseQRInvalid] = "You do not have a valid QR Barcode license.";
	ErrStr[EmErr.License1DInvalid] = "You do not have a valid 1D Barcode license.";
	ErrStr[EmErr.LicensePDF417Invalid] = "You do not have a valid PDF417 barcode license.";
	ErrStr[EmErr.LicenseDataMatrixInvalid] = "You do not have a valid DATAMATRIX barcode license.";
	ErrStr[EmErr.DIBBufferInvalid] = "Invalid DIB Buffer.";
	ErrStr[EmErr.PageNumberInvalid] = "The page number is invalid.";
	ErrStr[EmErr.RecognitionTimeout] = "Recognition timeout.";
	ErrStr[EmErr.ServiceInternalError] = "({0}) {1}";

	env._errorLoaded = true;
})(dynamsoft.dbrEnv, dynamsoft.lib);/**
* init
*/
(function(env, lib){
	if(env._initLoaded){
		return;
	}

	var isAltPort = false;
	function getUrlRoot(){
		return (dynamsoft.navInfo.bSSL ? "https://" : "http://") + "127.0.0.1:" + (dynamsoft.navInfo.bSSL ? env.portSSL[isAltPort?1:0] : env.port[isAltPort?1:0]) + "/dcp/dbr_" + env.version.replace(/\./g, "") + "/";
	}
	env._urlRoot = getUrlRoot();

	function getDialog(content){
		var father = document.createElement("div");
		var ts = (new Date()).getTime();
		father.innerHTML = 
		"<div id='dbrdlg"+ts+"' style='box-sizing: border-box; font-family:verdana,sans-serif; position:absolute; left: 0; top: 0; width: 100%; height: 100%; z-index:500000'>"
			// fog
			+"<div style='position:absolute; left: 0; top: 0; width: 100%; height: 100%; *height:expression(eval(document.body.offsetHeight)+\"px\"); background-color: #000; opacity: 0.3; filter:alpha(opacity:30)\\9; z-index: 500000;'></div>"
			// main dialog
			+"<div style='box-sizing: border-box; color: #606060; padding: 5px; position:fixed; margin: auto;  _position:absolute; width: 392px; height: 274px; left: 0; *left:50%; *margin-left:-196px; right: 0; top: 0; *top:50%; _top:expression(eval(document.documentElement.scrollTop + document.documentElement.clientHeight/2)+\"px\");*margin-top:-137px; bottom: 0; z-index: 500002; border: 1px solid #e7e7e7; background-color: #f1f2f2; overflow-y:hidden;'>"
				+"<div style='box-sizing: border-box; height: 264px; padding: 15px; border: 1px solid #e7e7e7; background-color: #fff;'>"
					+"<img src='"+env.resourcesPath+"/logo.gif'>"
					+"<div style='font-size: 12px; color: #0000ed; position: absolute; right: 15px; top: 15px; cursor: pointer; text-decoration: none;' onclick='document.getElementById(\"dbrdlg"+ts+"\").style.display=\"none\"'>X</div>"
					+content
				+"</div>"
			+"</div>"
			//iframe for ie6
			+((dynamsoft.navInfo.bIE && parseInt(dynamsoft.navInfo.strBrowserVersion) <= 6)?"<iframe frameborder=0 style='position:absolute; left:0; top:0; width: 100%; height:expression(eval(document.body.offsetHeight)+\"px\"); filter:alpha(opacity:0); z-index: 499999;'></iframe>":"")
		+"</div>";
		var child = father.childNodes[0];

		/*(function(child){
			// 'X' close btn
			child.getElementsByTagName('div')[3].onclick = function(){
				//alert("X clicked.");
				// if(typeof console != 'undefined'){
				// 	console.log("X clicked.");
				// }
				child.parentNode.removeChild(child);
			};
		})(child);*/
		return child;
	}

	/** 
	* call local service
	* if fail, need download DWAS, show install dialog
	* if dbr module no, download
	* if dbr, setTimeout to retry, max times 6
	*/ 

	var connDbrCount = 0;
	var EmErr = env.EnumDBRErrorCode;
	var ErrStr = env._DBRErrorStr;
	var linkDcpItv = null;
	var installDialog = null;
	var isNeedShowItlDlg = true;

	// setTimeout load
	env.init = function(onSuccess, onError){
		if(onSuccess && typeof onSuccess != 'function'){
			throw "init(onSuccess, onError): Argument 'onSuccess' must be a function. "
		}
		if(onError && typeof onError != 'function'){
			throw "init(onSuccess, onError): Argument 'onError' must be a function. "
		}
		if(linkDcpItv != null){
			return;
		}
		dynamsoft.initOrder = dynamsoft.initOrder || [];
		dynamsoft.initOrder.push('dbr');
		linkDcpItv = setInterval(function(){
			if(dynamsoft.initOrder && dynamsoft.initOrder[0] == 'dbr'){
				isNeedShowItlDlg = true;
				dynamsoft.initOrder.shift();
				clearInterval(linkDcpItv);
				if(env.ifShowLoadingImg){
					showLoadingImg();
				}
				env._connectDWAS(onSuccess, onError);
			}
		}, 100);
	};

	var showDWASInstallDialog = function(){
		if(!installDialog){
			installDialog = getDialog(
				"<style>.btn-dbr-download-dwas:hover{background-position: 0 -34px;} .btn-dbr-download-dwas:active{background-position: 0 -68px;}</style>"
				+"<div style='font-weight: bold;'>Dynamsoft Service is not installed</div>"
				+"<div style='text-align: center; padding: 20px 0;'>"
					//style='box-sizing: border-box; color: #606060; width: 180px; height: 34px; display: inline-block; padding: 8px; font-size: 14px; text-align: center; cursor: pointer; background-color: #f99b34; border-left: 1px solid #e7e7e7; border-top: 1px solid #ddd; border-right: 1px solid #aaa; border-bottom: 1px solid #999; border-radius: 4px; text-decoration: none;'
					+"<a class='btn-dbr-download-dwas' href='"+env.resourcesPath+"/DynamsoftServiceSetup.exe?t="+(new Date()).getTime()+"&filename=DynamsoftServiceSetup.exe' target='_blank' style=\"display: inline-block; background-image: url('"+env.resourcesPath+"/btn-download.png'); background-repeat: no-repeat; width: 180px; height: 34px; position: relative; margin: 0 auto; cursor: pointer;\"></a>"
					+"<div style='margin-top: 5px; font-style: italic; font-size: 12px;'>* Please manually install it</div>"
				+"</div>"
				+"<div style='font-size: 14px; line-height: 25px;'>If you still see the dialog after the installation, please check this <a style='text-decoration:none;color:#f58831;' href='http://kb.dynamsoft.com/questions/923' target='_blank'>article</a> for troubleshooting.</div>"
			);
			document.body.appendChild(installDialog);
		}else{
			installDialog.style.display = '';
		}
	};

	var hideDWASInstallDialog = function(){
		if(installDialog){
			installDialog.style.display = "none";
		}
	};

	var loadingImg = null;
	var showLoadingImg = function(){
		if(!loadingImg){
			var father = document.createElement("div");
			father.innerHTML = 
			"<div style='position:absolute; left: 0; top: 0; width: 100%; height: 100%; z-index:500000'>"
				// fog
				+"<div style='position: absolute; left: 0; top: 0; width: 100%; height: 100%; *height:expression(eval(document.body.offsetHeight)+\"px\"); background-color: #000; opacity: 0.3; filter:alpha(opacity:30)\\9; z-index: 500000;'></div>"
				+"<img src='"+env.resourcesPath+"/loading.gif' style='position:fixed;margin:auto;left:0;top:0;right:0;bottom:0;*left:50%;*top:50%;width:64px;height:64px;*margin-left:-32px;*margin-top:-32px;_position:absolute;_top:expression(eval(document.documentElement.scrollTop + document.documentElement.clientHeight/2));z-index: 500002;'>"
				//iframe for ie6
				+((dynamsoft.navInfo.bIE && parseInt(dynamsoft.navInfo.strBrowserVersion) <= 6)?"<iframe frameborder=0 style='position:absolute; left:0; top:0; width: 100%; height:expression(eval(document.body.offsetHeight)+\"px\"); filter:alpha(opacity:0); z-index: 499999;'></iframe>":"")
			+'</div>';
			loadingImg = father.childNodes[0];
			document.body.appendChild(loadingImg);
		}else{
			loadingImg.style.display = '';
		}
	};
	var hideLoadingImg = function(){
		if(loadingImg){
			loadingImg.style.display = 'none';
		}
	};

	var connDwasCount = 0;
	env._connectDWAS = function(onSuccess, onError){
		if(connDwasCount >= env.maxInitConnDwasTimes){
			connDwasCount = 0;
			linkDcpItv = null;
			hideLoadingImg();
			onError(EmErr.ConnectDwasFailed, ErrStr[EmErr.ConnectDwasFailed]);
			return;
		}
		dynamsoft.dcpV2.versionInfo(function(_data, statusStr, wrapedXhr){
			//console.log("connecting DWAS ...");
			if(dynamsoft.dcpV2.detect.bConnected){

				// ie6 doesn't support console
				if(env.ifShowLogWhenConnSuccess && typeof console != 'undefined'){
					try{
						var dataObj = lib.parse(_data);
						console.log(dataObj.result[0]+" "+dataObj.result[1]);
					}catch(e){
						console.log(_data);
					}
				}

				hideDWASInstallDialog();
				isAltPort = !!dynamsoft.dcpV2.detect.curPortIndex;
				connDwasCount = 0;
				if(env.ifShowLoadingImg){
					showLoadingImg();
				}
				env._loadModule(onSuccess, onError);
			}else{
				// if haven't show in this init, show dlg
				hideLoadingImg();
				if(isNeedShowItlDlg){
					showDWASInstallDialog();
					isNeedShowItlDlg = false;
				}
				
				//if(onError) onError(EmErr.ConnectDBRModuleFailed, ErrStr[EmErr.ConnectDBRModuleFailed]);
				//linkDcpItv = null;
				//alert("before setTimeout");
				setTimeout(function(){env._connectDWAS(onSuccess, onError);}, env.continConnInterval);
			}
		});
		++connDwasCount;
	};
	
	env._loadModule = function(onSuccess, onError){
		env._urlRoot = getUrlRoot();
		isAltPort = !isAltPort;
		//console.log(linkDcpItv+"(-1):"+connDbrCount+",url:"+env._urlRoot);
		lib.ajax({
		    method: "POST",
			url: env._urlRoot + "VersionInfo",
			data: lib.stringify({
				method: "VersionInfo"
			}),
			onSuccess: function(_data, statusStr, wrapedXhr){
				// init dbr object(no object?)

				var dllVersion;
				try{
					dllVersion = _data.result[0];
					dllVersion = dllVersion.replace(/\s+/g, '').replace(/,/g, '.');
				}catch(ex){}
				// ie6 doesn't support console
				if(env.ifShowLogWhenConnSuccess && typeof console != 'undefined'){
					try{
						console.log(_data.result[0]+" "+_data.result[1]);
					}catch(ex){
						console.log(_data);
					}
				}
				env.versionInfo = 'JS version: '+env.version+', Dll version: '+dllVersion;
				connDbrCount = 0;
				linkDcpItv = null;
				hideLoadingImg();
				if(onSuccess) onSuccess(_data, statusStr, wrapedXhr);
			},
			onError: function(_data, statusStr, wrapedXhr){
				//console.log(linkDcpItv+"(0):"+connDbrCount+",url:"+env._urlRoot);
				if(connDbrCount == 1){//download start when both normal and alt port connect fail
					// download module zip
					var libPath = env.resourcesPath + "/"
						+ (dynamsoft.navInfo.bMac? "Mac" : "Win")
						+ "DBR_" + env.version + ".zip?t=" + (new Date()).getTime();
					env._download(
						libPath,
						true,
						function(DbrModuleBinary, statusStr, wrapedXhr){
							// send zip to local service
							dynamsoft.dcpV2.loadZip(
								DbrModuleBinary, 
								100, // tudo: ask what this means?
								function(){
									// load zip success, continue connect dbr module
									setTimeout(function(){env._loadModule(onSuccess, onError);}, env.continConnInterval);
								},
								function(_data, statusStr, wrapedXhr){
									// load zip err
									if(env.ifShowDialogWhenModuleLoadFail){
										document.body.appendChild(getDialog("<p style='margin-top:30px'>"+ErrStr[EmErr.SendDBRModuleFailed]+" Network status: " + wrapedXhr.status + "</p>"));
									}
									connDbrCount = 0;
									linkDcpItv = null;
									hideLoadingImg();
									if(onError) onError(EmErr.SendDBRModuleFailed, ErrStr[EmErr.SendDBRModuleFailed]);
								}
							);
						},
						function(_data, statusStr, wrapedXhr){
							// download err
							if(env.ifShowDialogWhenModuleLoadFail){
								document.body.appendChild(getDialog(
									"<p style='margin-top:30px'>"+ErrStr[EmErr.DownloadDBRModuleFailed]+" Network status: " + wrapedXhr.status 
									+ (wrapedXhr.status == 404 ? ""/*". DbrModule zip might not exist in web server. "*/ : 
										(wrapedXhr.status == 0 ? ". It might be a cross origin requests from 'file://'. The site must be deployed on a web server to download DbrModule zip. " : "")) 
									+ "</p>"));
							}
							connDbrCount = 0;
							linkDcpItv = null;
							hideLoadingImg();
							if(onError) onError(EmErr.DownloadDBRModuleFailed, ErrStr[EmErr.DownloadDBRModuleFailed]);
						},
						null
					);
					// not connect dbr module when downloading zip
					++connDbrCount;
					return;
				}
				//console.log(linkDcpItv+"(1):"+connDbrCount+",url:"+env._urlRoot);
				// if(linkDcpItv == null){ // onError has been run when module load fail
				// 	return;
				// }
				++connDbrCount;
				if(connDbrCount >= env.maxInitConnDbrTimes){
					connDbrCount = 0;
					linkDcpItv = null;
					hideLoadingImg();
					if(onError) onError(EmErr.ConnectDBRModuleFailed, ErrStr[EmErr.ConnectDBRModuleFailed]);
					return;
				}
				//console.log(linkDcpItv+"(2):"+connDbrCount+",url:"+env._urlRoot);
				// test if load dll success after some ms
				setTimeout(function(){env._loadModule(onSuccess, onError);}, env.continConnInterval);
			},
			dataType: 'json',
			async: true,
			timeout: env.qTaskTimeout
		});
	};

	if(env.isAutoInit){
		env.init(null, function(){alert('DBR init fail.');});
	}

	env._initLoaded = true;
})(dynamsoft.dbrEnv, dynamsoft.lib);
/**
* Enums
*/
(function(env, lib){
	if(env._enumLoaded){
		return;
	}

	env.EnumBarcodeFormat = { 
		EBF_All: 0,
		EBF_OneD : 1023,
		EBF_CODE_39: 1,
		EBF_CODE_128: 2,
		EBF_CODE_93: 4,
		EBF_CODABAR: 8,
		EBF_ITF: 16,
		EBF_EAN_13: 32,
		EBF_EAN_8: 64,
		EBF_UPC_A: 128,
		EBF_UPC_E: 256,
		EBF_INDUSTRIAL_25: 512,
		EBF_PDF417: 33554432,
		EBF_QR_CODE: 67108864,
		EBF_DATAMATRIX: 134217728 
	};

	env.EnumImageCaptureDevice = { 
		EICD_Unknown: 0, 
		EICD_Scanner: 1, 
		EICD_Camera: 2, 
		EICD_Fax: 3 
	}; 

	env.EnumBarcodeColorMode = {
		EBCM_DarkOnLight: 0,
		EBCM_LightOnDark: 1, 
		EBCM_DarkAndLight: 2
	}; 

	env.EnumBarcodeTextEncoding = { 
		EBTE_Default: 0, //By Windows System Code Page(For CN: 936) 
		EBTE_SHIFT_JIS_932: 932, //Japanese 
		EBTE_GB2312_936: 936, //simple Chinese 
		EBTE_Korean_949: 949, //Korean 
		EBTE_BIG5_950: 950, //Traditional Chinese 
		EBTE_UTF16: 1200, //UTF16 
		EBTE_UTF16BE: 1201, //UTF16 big endian 
		EBTE_UTF8: 65001 //UTF8 
	}; 

	env.EnumBarcodeOrientationType = {
		EBOT_Horizontal: 0,
		EBOT_Vertical: 1
	}; 

	env.EnumScanRegionSide = {
		ESRS_Left: 0,
		ESRS_Top: 1,
		ESRS_Right: 2,
		ESRS_Bottom: 3
	}; 

	env._EnumDataStoreType = {
		Binary: 0,
		Base64: 1,
		InnerUrl: 4000
	};

	env._EnumImageType = {
		Unknown: 0, // when can't read binary, can't get mimetype, or mimetype is empty or binary
		BMP: 1,
		JPG: 2,
		TIF: 3,
		PNG: 4,
		PDF: 5,
		GIF: 1001,
		Invalid: -1
	};
	env._getImageMimeTypeFromStr = function(str){
		var ei = env._EnumImageType;
		switch(str){
			case "": 
			case "application/octet-stream": return ei.Unknown;
			case "image/bmp": return ei.BMP;
			case "image/jpeg": return ei.JPG;
			case "image/tiff": return ei.TIF;
			case "image/png": return ei.PNG;
			case "application/pdf": return ei.PDF;
			case "image/gif": return ei.GIF;
			default: return ei.Invalid;
		}
	};
	env._getImageTypeFromBinary = function(binary){
		if(typeof Blob != 'undefined' && binary instanceof Blob){//Blob
			return env._getImageMimeTypeFromStr(binary.type);
		}
		var hBytes;
		if(binary.byteLength && binary.slice){//ArrayBuffer
			var hArrBuf = binary.byteLength > 7 ? binary.slice(0, 7) : binary ;
			hBytes = new Uint8Array(hArrBuf);
		}else if(binary.length && binary.slice){//Array,Uint8Array
			hBytes = binary.length > 7 ? binary.slice(0, 7) : binary ;
		}else if(binary.length && binary.subarray){//Uint8Array for ie
			hBytes = binary.length > 7 ? binary.subarray(0, 7) : binary ;
		}else{
			return env._EnumImageType.Unknown;
		}
		var h16bitStr = '';
		for(var i = 0; i < hBytes.length; ++i){
			var str = hBytes[i].toString(16);
			if(str.length == 1){
				str = '0' + str;
			}
			h16bitStr += str;
		}
		var ei = env._EnumImageType;
		if(h16bitStr.indexOf('424d') == 0){
			return ei.BMP;
		}else if(h16bitStr.indexOf('ffd8ff') == 0){
			return ei.JPG;
		}else if(h16bitStr.indexOf('49492a00') == 0){
			return ei.TIF;
		}else if(h16bitStr.indexOf('89504e47') == 0){
			return ei.PNG;
		}else if(h16bitStr.indexOf('255044462d312e') == 0){
			return env._EnumImageType.PDF;
		}else if(h16bitStr.indexOf('47494638') == 0){
			return ei.GIF;
		}else{
			return ei.Invalid;
		}
	};

	env._isInEnum = function(value, em){
		for(var item in em){
			if(em[item] === value){
				return true;
			}
		}
		return false;
	};

	env._enumLoaded = true;
})(dynamsoft.dbrEnv, dynamsoft.lib);

/**
* class BarcodeReader
*/
(function(env, lib){
	if(env._barcodeReaderLoaded){
		return;
	}
	// support 
	var EmErr = env.EnumDBRErrorCode;
	var ErrStr = env._DBRErrorStr;
	// function: is integer in [-0x80000000(binary is 0x80000000), 0x7fffffff]
	function isInt(obj){
		return (typeof obj == 'number') && (obj >= -0x80000000) && (obj <= 0x7fffffff) && (obj%1 === 0);
	}
	// function: is nonnegative integer in [0, 0xffffffff]
	function isUSInt(obj){
		return (typeof obj == 'number') && (obj >= 0) && (obj <= 0xffffffff) && (obj%1 === 0);
	}
	// function: is nonnegative integer in [0, 0x7fffffff]
	function isNNInt(obj){
		return (typeof obj == 'number') && (obj >= 0) && (obj <= 0x7fffffff) && (obj%1 === 0);
	}
	// function: is positive integer in [1, 0x7fffffff]
	function isPosInt(obj){
		return (typeof obj == 'number') && (obj >= 1) && (obj <= 0x7fffffff) && (obj%1 === 0);
	}
	// struct: Region(int left, int top, int right, int bottom, bool isPercentage)
	function Region(left, top, right, bottom, isPercentage){
		this.Left = left;
		this.Top = top;
		this.Right = right;
		this.Bottom = bottom;
		this.ByPercentage = isPercentage? 1: 0;
	}
	// struct: AngleRange(int minAngle, int maxAngle)
	function AngleRange(minAngle, maxAngle){
		this.MinAngle = minAngle;
		this.MaxAngle = maxAngle;
	}
	/*support*/ 
    // function download
	function download(url){
		var data;
		var err;
		env._download(
			url,
			false,
			function(_data, statusStr, wrapedXhr){
				data = _data;
			},
			function(_data, statusStr, wrapedXhr){
				err = {};
				err.wrapedXhr = wrapedXhr;
				//"status: " + wrapedXhr.status + "," + statusStr;
			},
			null
		);
		if(err){
			throw err;
		}
		return data;
	}
	// function download async
	function downloadAsync(url, onSuccess, onError){
		env._download(
			url,
			true,
			onSuccess, //function(_data, statusStr, wrapedXhr)
			onError, //function(_data, statusStr, wrapedXhr)
			null
		);
	}
	// convertToBase64 when async=true, callback(base64)
	function convertToBase64(data, async, callback){
		// use dynamsoft-base64.js instead
		if( (typeof ArrayBuffer != "undefined") && (data instanceof ArrayBuffer) ){
			data = new Uint8Array(data);
		}
		if( (typeof Uint8Array != "undefined") && (data instanceof Uint8Array) || (data instanceof Array) ){
			var bRet = null;
			try{
				bRet = lib.BASE64.fromByteArray(data);
			}catch(e){}
			if(!async){
				return bRet;
			}else{
				callback(bRet);
			}
			
			// var binary = '';
			// var len = data.byteLength;
			// for(var i = 0; i < len; ++i){
			// 	binary += String.fromCharCode(data[i]);
			// }
			// return btoa(binary);
		}else if((typeof Blob != "undefined") && (data instanceof Blob) && async){
			var reader = new FileReader();
			(function(callback){
				reader.onload = function(e){
					var dataUrl = e.target.result;
					callback(dataUrl.substr(dataUrl.indexOf(',')+1));
				};
			})(callback);
			reader.readAsDataURL(data);
		}else{
			//myLog(typeof data);
			if(!async){
				return null;
				//throw "convertToBase64: Not support data type: "+data;
			}
			else if(async){
				//console.log("convertToBase64: Not support data type: "+data);
				callback(null);
			}
		}
	}
	function isBase64InSupportTypes(base64){
		//alert('ok');
		var hBase64 = base64.length > 12 ? base64.slice(0, 12) : base64 ;
		var hBytes;
		try{
			//alert('length of hBase64:'+hBase64.length);
			hBytes = lib.BASE64.toByteArray(hBase64);
		}catch(e){
			return false;
		}
		//alert('toByteArray success, typeof hBytes:'+(typeof hBytes));
		var type = env._getImageTypeFromBinary(hBytes);
		//alert('ByteArray get type ok');
		if(type != env._EnumImageType.Invalid && type != env._EnumImageType.PDF){
			return true;
		}else{
			return false;
		}
	}
	function isBinaryInSupportTypes(binary){
		var type = env._getImageTypeFromBinary(binary);
		if(type != env._EnumImageType.Invalid && type != env._EnumImageType.PDF){
			return true;
		}else{
			return false;
		}
	}
	function isErrNeedToBeThrow(exception){
		switch(exception){
			case 0:
			//case env.EmErr.LicenseInvalid:
			case EmErr.LicenseExpired:
			case EmErr.LicenseQRInvalid:
			case EmErr.License1DInvalid:
			case EmErr.LicensePDF417Invalid:
			case EmErr.LicenseDataMatrixInvalid:
				return false;
			default:
				return true;
		}
	}

	// onSucess must use, onError can be null
	var BarcodeReader = function(){
		this.useOneDDeblur = true;  
		this.imageCaptureDevice = env.EnumImageCaptureDevice.EICD_Unknown;
		this.barcodeFormats = env.EnumBarcodeFormat.EBF_All;
		this.maxBarcodesNumPerPage = 0x7fffffff;// max of signed int, 2147483647
		this.timeoutPerPage =  0x7fffffff;// max of signed int, 2147483647
		this.barcodeColorMode = env.EnumBarcodeColorMode.EBCM_DarkOnLight;
		this.barcodeTextEncoding = env.EnumBarcodeTextEncoding.EBTE_Default; 
		this.Pages = [];
		this.Regions = [];
		this.AngleRanges = [];

		this.errorCode = EmErr.OK;
		this.errorStr = ErrStr[EmErr.OK];
	};
	BarcodeReader.prototype.readBinary = function(blob){
		//var funStr = "readBlob(Blob blob): ";
		if(arguments.length < 1){
			this._setError(EmErr.ParameterNumberUnmatched);
			return null;
		}
		if(typeof Blob == 'undefined' || !(blob instanceof Blob)){
			this._setError(EmErr.TypeNotValid, ['blob']);
			return null;
		}
		//** parameters check end
		var startTime = (new Date()).getTime();

		// if(!(blob instanceof Blob) && !(blob instanceof Uint8Array) && !(blob instanceof Array) && typeof blob != 'unknown'){
		// 	throw funStr + "Argument 'blob' must be a instanceof Blob, Uint8Array, Array or ie byte array type. ";
		// }
		if(!this._checkAndRepairOption()){
			return null;
		}
		if(!isBinaryInSupportTypes(blob)){
			this._setError(EmErr.FileTypeNotSupported);//funStr + "Only jpg,png,tif,gif,bmp supported. ";
			return null;
		}
		var cmd = {
			method: "ReadBarcode",
			parameter: [
				env.productKey, 
				env._EnumDataStoreType.Binary,//source img type 
				null,//not binary data
				this._toServiceStr()
			]
		};
		var url = env._urlRoot + "ReadBarcode/LoadZipFromBytes?cmd=" + encodeURIComponent(lib.stringify(cmd));

		var readResult = null;
		var errorCode;
		var errorInfo;

		lib.ajax({
			method: "POST",
			url: url,
			data: blob,
			onSuccess: function(_data, statusStr, wrapedXhr){
				var resObj = lib.parse(_data);
				if(resObj === false){
					errorCode = EmErr.JsonParseFailed;//'Json parse fail. Json:\n' + _data;
					return;
				}
				errorCode = resObj.exception;
				errorInfo = [resObj.description];
				if(isErrNeedToBeThrow(resObj.exception)){
					return;
				}
				readResult = new env.ReadResult(resObj, startTime);
			},
			onError: function(_data, statusStr, wrapedXhr){
				errorCode = EmErr.HttpError;
				errorInfo = [wrapedXhr.status];//"status: " + wrapedXhr.status + "," + statusStr;
			},
			dataType: 'text',
			async: false
		});

		this._setError(errorCode, errorInfo);
		return readResult;
	};
	BarcodeReader.prototype.readBinaryAsync = function(blob, userData, asyncSuccessFunc, asyncFailureFunc){
		//var funStr = "readBlob(Blob blob, Anything userData, asyncSuccessFunc, asyncFailureFunc): ";
		// if(!(blob instanceof Blob) && !(blob instanceof Uint8Array) && !(blob instanceof Array) && typeof blob != 'unknown'){
		// 	throw funStr + "Argument 'blob' must be a instanceof Blob, Uint8Array, Array or ie byte array type. ";
		// }
		return (function(reader, blob, userData, asyncSuccessFunc, asyncFailureFunc){

			if(arguments.length < 4){
				reader._setError(EmErr.ParameterNumberUnmatched);
				return false;
			}
			if(/*asyncFailureFunc && */(typeof asyncFailureFunc != 'function')){
				reader._setError(EmErr.TypeNotValid, ['asyncFailureFunc']);//funStr + "Argument 'asyncFailureFunc(userData, errorCode, errorStr)' must be a function. ";
				return false;
			}
			if(typeof Blob == 'undefined' || !(blob instanceof Blob)){
				reader._setError(EmErr.TypeNotValid, ['blob'], asyncFailureFunc, userData);
				return false;
			}
			if(typeof asyncSuccessFunc != 'function'){
				reader._setError(EmErr.TypeNotValid, ['asyncSuccessFunc'], asyncFailureFunc, userData);//funStr + "Argument 'asyncSuccessFunc(userData, readResult)' must be a function. ";
				return false;
			}
			//** parameters check end
			var startTime = (new Date()).getTime();

			if(!reader._checkAndRepairOption(asyncFailureFunc, userData, true)){
				return true;
			}
			if(!isBinaryInSupportTypes(blob)){
				reader._setThrowDisbleError(EmErr.FileTypeNotSupported, null, asyncFailureFunc, userData);//funStr + "Only jpg,png,tif,gif,bmp supported. ");
				return true;
			}
			var cmd = {
				method: "ReadBarcode",
				parameter: [
					env.productKey, 
					env._EnumDataStoreType.Binary,//source img type 
					null,//not binary data
					reader._toServiceStr()
				]
			};
			var url = env._urlRoot + "ReadBarcode/LoadZipFromBytes?cmd=" + encodeURIComponent(lib.stringify(cmd));

			lib.ajax({
				method: "POST",
				url: url,
				data: blob,
				onSuccess: function(_data, statusStr, wrapedXhr){
					var resObj = lib.parse(_data);
					if(resObj === false){
						resObj = {};
						resObj.exception = EmErr.JsonParseFailed;//'Json parse fail. Json:\n' + _data;
					}
					reader._setThrowDisbleError(resObj.exception, [resObj.description], asyncFailureFunc, userData);
					if(isErrNeedToBeThrow(resObj.exception)){
						return;
					}
					var readResult = new env.ReadResult(resObj, startTime);
					asyncSuccessFunc(userData, readResult);
				},
				onError: function(_data, statusStr, wrapedXhr){
					reader._setThrowDisbleError(EmErr.HttpError, [wrapedXhr.status], asyncFailureFunc, userData);//"status: " + wrapedXhr.status + "," + statusStr);
				},
				dataType: 'text',
				async: true
			});

			return true;
		})(this, blob, userData, asyncSuccessFunc, asyncFailureFunc);

	};
	BarcodeReader.prototype.readURL = function(imageUrl) {
		//var funStr = "read(string imageUrl): ";
		if(arguments.length < 1){
			this._setError(EmErr.ParameterNumberUnmatched);
			return null;
		}
		if(typeof imageUrl != 'string'){
			//funStr + "Argument 'imageUrl' must be a string. ";
			this._setError(EmErr.TypeNotValid, ['imageUrl']);
			return null;
		}
		if(imageUrl.length == 0){
			this._setError(EmErr.ValueNotValid, ['imageUrl']);
			return null;
		}
		//** parameters check end
		var startTime = (new Date()).getTime();

		imageUrl = lib.trim(imageUrl);
		if(!this._checkAndRepairOption()){
			return null;
		}
		var isInnerUrl = (imageUrl.indexOf("dwt://") == 0 || imageUrl.indexOf("dcs://") == 0);
		var downloadData;
		var imgBase64;
		if(!isInnerUrl){
			try{
				downloadData = download(imageUrl);
			}catch(e){
				this._setError(EmErr.HttpError, [e.wrapedXhr.status]);
				return null;
			}
			imgBase64 = convertToBase64(downloadData);
		}
		var url = env._urlRoot + "ReadBarcode";
		var cmd = {
			method: "ReadBarcode",
			parameter: [
				env.productKey, 
				null,//source img type 
				null,//not binary data
				this._toServiceStr()
			]
		};
		var data;
		if(isInnerUrl){
			cmd.parameter[1] = env._EnumDataStoreType.InnerUrl;
			cmd.parameter[2] = imageUrl;
			data = lib.stringify(cmd);
		}else if(imgBase64){
			// base64
			// if(imgBase64.length == 0){
			// 	throw 'Can not read data. Please make sure date is not empty. ';
			// }
			if(!isBase64InSupportTypes(imgBase64)){
				//funStr + "Only jpg,png,tif,gif,bmp supported. ";
				this._setError(EmErr.FileTypeNotSupported);
				return null;
			}
			cmd.parameter[1] = env._EnumDataStoreType.Base64;
			cmd.parameter[2] = imgBase64;
			data = lib.stringify(cmd);
		}else if(typeof downloadData == 'unknown'){
			// unknown download data type (vbScript type), put cmd json to url, body with binary data
			cmd.parameter[1] = env._EnumDataStoreType.Binary;
			url += "/LoadZipFromBytes?cmd=" + encodeURIComponent(lib.stringify(cmd));
			data = downloadData;
		}else{
			this._setError(EmErr.ValueNotValid, ['imageUrl']);//, 'Can not read data. Please make sure date is not empty. ');
			//funStr + 'Can not read data. Please make sure date is not empty. ';
			return null;
		}
		var readResult = null;
		var errorCode;
		var errorInfo;
		//myLog(typeof data);
		lib.ajax({
			method: "POST",
			url: url,
			data: data,
			onSuccess: function(_data, statusStr, wrapedXhr){
				var resObj = lib.parse(_data);
				if(resObj === false){
					errorCode = EmErr.JsonParseFailed;//'Json parse fail. Json:\n' + _data;
					return;
				}
				errorCode = resObj.exception;
				errorInfo = [resObj.description];
				if(isErrNeedToBeThrow(resObj.exception)){
					return;
				}
				readResult = new env.ReadResult(resObj, startTime);
			},
			onError: function(_data, statusStr, wrapedXhr){
				errorCode = EmErr.HttpError;
				errorInfo = [wrapedXhr.status];//"status: " + wrapedXhr.status + "," + statusStr;
			},
			dataType: 'text',
			async: false
		});

		this._setError(errorCode, errorInfo);
		return readResult;
	}
	BarcodeReader.prototype.readURLAsync = function(imageUrl, userData ,asyncSuccessFunc, asyncFailureFunc) {
		//var funStr = "readAsync(string imageUrl, Anything userData, OnBarcodeReadSuccess asyncSuccessFunc, OnBarcodeReadFailure asyncFailureFunc): ";
		return (function(reader, imageUrl, userData ,asyncSuccessFunc, asyncFailureFunc){

			if(arguments.length < 4){
				reader._setError(EmErr.ParameterNumberUnmatched);
				return false;
			}
			if(/*asyncFailureFunc && */(typeof asyncFailureFunc != 'function')){
				reader._setError(EmErr.TypeNotValid, ['asyncFailureFunc']);
				//funStr + "Argument 'asyncFailureFunc(userData, errorCode, errorStr)' must be a function. ";
				return false;
			}
			if(typeof imageUrl != 'string'){
				//funStr + "Argument 'imageUrl' must be a string. ";
				reader._setError(EmErr.TypeNotValid, ['imageUrl'], asyncFailureFunc, userData);
				return false;
			}
			if(imageUrl.length == 0){
				reader._setError(EmErr.ValueNotValid, ['imageUrl'], asyncFailureFunc, userData);
				return false;
			}
			if(typeof asyncSuccessFunc != 'function'){
				//funStr + "Argument 'asyncSuccessFunc(userData, readResult)' must be a function. ";
				reader._setError(EmErr.TypeNotValid, ['asyncSuccessFunc'], asyncFailureFunc, userData);
				return false;
			}
			//** parameters check end
			var startTime = (new Date()).getTime();

			imageUrl = lib.trim(imageUrl);
			if(!reader._checkAndRepairOption(asyncFailureFunc, userData, true)){
				return true;
			}

			var isInnerUrl = (imageUrl.indexOf("dwt://") == 0 || imageUrl.indexOf("dcs://") == 0);
			var readBarcodeAjaxCfg = {
				method: "POST",
				url: env._urlRoot + "ReadBarcode",
				data: null,
				onSuccess: function(_data, statusStr, wrapedXhr){
					var resObj = lib.parse(_data);
					if(resObj === false){
						resObj = {};
						resObj.exception = EmErr.JsonParseFailed;//'Json parse fail. Json:\n' + _data;
					}
					reader._setThrowDisbleError(resObj.exception, [resObj.description], asyncFailureFunc, userData);
					if(isErrNeedToBeThrow(resObj.exception)){
						return;
					}
					var readResult = new env.ReadResult(resObj, startTime);
					asyncSuccessFunc(userData, readResult);
				},
				onError: function(_data, statusStr, wrapedXhr){
					reader._setThrowDisbleError(EmErr.HttpError, [wrapedXhr.status], asyncFailureFunc, userData);
				},
				dataType: 'text',
				async: true
			};
			var cmd = {
				method: "ReadBarcode",
				parameter: [
					env.productKey, 
					null,//source img type 
					null,//not binary data
					reader._toServiceStr()
				]
			};
			if(isInnerUrl){
				cmd.parameter[1] = env._EnumDataStoreType.InnerUrl;
				cmd.parameter[2] = imageUrl;
				readBarcodeAjaxCfg.data = lib.stringify(cmd);
				lib.ajax(readBarcodeAjaxCfg);
				return true;
			}else{
				downloadAsync(
					imageUrl,
					// onSuccess
					function(downloadData, statusStr, wrapedXhr){
						convertToBase64(downloadData, true, function(imgBase64){
							if(imgBase64){
								// base64
								// if(imgBase64.length == 0){
								// 	if(asyncFailureFunc)asyncFailureFunc(userData, -1, "Only jpg,png,tif,gif,bmp supported. ");
								// }
								if(!isBase64InSupportTypes(imgBase64)){
									//reader._setError(EmErr.FileTypeNotSupported);//"Only jpg,png,tif,gif,bmp supported. ");
									reader._setThrowDisbleError(EmErr.FileTypeNotSupported, null, asyncFailureFunc, userData);
									return;
								}
								cmd.parameter[1] = env._EnumDataStoreType.Base64;
								cmd.parameter[2] = imgBase64;
								readBarcodeAjaxCfg.data = lib.stringify(cmd);
								lib.ajax(readBarcodeAjaxCfg);
								return;
							}else if(typeof downloadData == 'unknown'){
								// unknown download data type (vbScript type), put cmd json to url, body with binary data
								cmd.parameter[1] = env._EnumDataStoreType.Binary;
								readBarcodeAjaxCfg.url += "/LoadZipFromBytes?cmd=" + encodeURIComponent(lib.stringify(cmd));
								readBarcodeAjaxCfg.data = downloadData;
								lib.ajax(readBarcodeAjaxCfg);
								return;
							}else{
								// is empty?
								//if(asyncFailureFunc)asyncFailureFunc(userData, EmErr.ValueNotValid, funStr + 'Can not read data. Please make sure date is not empty. ');
								reader._setThrowDisbleError(EmErr.ValueNotValid, ["imageUrl"]/*'Can not read data. Please make sure date is not empty. '*/, asyncFailureFunc, userData);
							}
						});
					},
					// onError
					function(_data, statusStr, wrapedXhr){
						reader._setThrowDisbleError(EmErr.HttpError, [wrapedXhr.status], asyncFailureFunc, userData);
					}
				);
			}

			return true;
		})(this, imageUrl, userData ,asyncSuccessFunc, asyncFailureFunc);

	};
	BarcodeReader.prototype.readBase64 = function(base64img) {
		//var funStr = "readBase64(string base64img): ";
		if(arguments.length < 1){
			this._setError(EmErr.ParameterNumberUnmatched);
			return null;
		}
		if(typeof base64img != 'string'){
			this._setError(EmErr.TypeNotValid, ['base64img']);
			return null;
		}
		if(base64img.length == 0){
			//var es = funStr + "Argument 'base64img' should not be empty. ";
			this._setError(EmErr.ValueNotValid, ['base64img']);
			return null;
		}
		//** parameters check end

		var startTime = (new Date()).getTime();

		base64img = lib.trim(base64img);
		if(!this._checkAndRepairOption()){
			return null;
		}
		if(!isBase64InSupportTypes(base64img)){
			this._setError(EmErr.FileTypeNotSupported, ['base64img']);
			return null;
		}
		var readResult;
		var errorCode;
		var errorInfo;
		lib.ajax({
			method: "POST",
			url: env._urlRoot + "ReadBarcode",
			data: lib.stringify({
				method: "ReadBarcode",
				parameter: [
					env.productKey, 
					env._EnumDataStoreType.Base64,
					base64img, 
					this._toServiceStr()
				]
			}),
			onSuccess: function(_data, statusStr, wrapedXhr){
				var resObj = lib.parse(_data);
				if(resObj === false){
					errorCode = EmErr.JsonParseFailed;//'Json parse fail. Json:\n' + _data;
					return;
				}
				errorCode = resObj.exception;
				errorInfo = [resObj.description];
				if(isErrNeedToBeThrow(resObj.exception)){
					return;
				}
				readResult = new env.ReadResult(resObj, startTime);
			},
			onError: function(_data, statusStr, wrapedXhr){
				errorCode = EmErr.HttpError;
				errorInfo = [wrapedXhr.status];//"status: " + wrapedXhr.status + "," + statusStr;
			},
			dataType: 'text',
			async: false
		});

		this._setError(errorCode, errorInfo);
		return readResult;
	};
	BarcodeReader.prototype.readBase64Async = function(base64img, userData, asyncSuccessFunc, asyncFailureFunc) {
		//var funStr = "readBase64Async(string base64img, Anything userData, OnBarcodeReadSuccess asyncSuccessFunc, OnBarcodeReadFailure asyncFailureFunc): " 
		return (function(reader, base64img, userData, asyncSuccessFunc, asyncFailureFunc){

			if(arguments.length < 4){
				reader._setError(EmErr.ParameterNumberUnmatched);
				return false;
			}
			if(/*asyncFailureFunc && */(typeof asyncFailureFunc != 'function')){
				reader._setError(EmErr.TypeNotValid, ['asyncFailureFunc']);
				return false;
			}
			if(typeof base64img != 'string'){
				//var es = funStr + "Argument 'base64img' must be a string. ";
				reader._setError(EmErr.TypeNotValid, ['base64img'], asyncFailureFunc, userData);
				return false;
			}
			if(base64img.length == 0){
				//var es = funStr + "Argument 'base64img' should not be empty. ";
				reader._setError(EmErr.ValueNotValid, ['base64img'], asyncFailureFunc, userData);
				return false;
			}
			if(typeof asyncSuccessFunc != 'function'){
				//var es = funStr + "Argument 'asyncSuccessFunc(userData, readResult)' must be a function. ";
				reader._setError(EmErr.TypeNotValid, ['asyncSuccessFunc'], asyncFailureFunc, userData);
				return false;
			}
			//** parameters check end

			var startTime = (new Date()).getTime();
			base64img = lib.trim(base64img);
			if(!reader._checkAndRepairOption(asyncFailureFunc, userData, true)){
				return true;
			}
			if(!isBase64InSupportTypes(base64img)){
				reader._setThrowDisbleError(EmErr.FileTypeNotSupported, null, asyncFailureFunc, userData);
				return true;
			}

			lib.ajax({
				method: "POST",
				url: env._urlRoot + "ReadBarcode",
				data: lib.stringify({
					method: "ReadBarcode",
					parameter: [
						env.productKey, 
						env._EnumDataStoreType.Base64,
						base64img, 
						reader._toServiceStr()
					]
				}),
				onSuccess: function(_data, statusStr, wrapedXhr){
					var resObj = lib.parse(_data);
					if(resObj === false){
						resObj = {};
						resObj.exception = EmErr.JsonParseFailed;//'Json parse fail. Json:\n' + _data;
					}
					reader._setThrowDisbleError(resObj.exception, [resObj.description], asyncFailureFunc, userData);
					if(isErrNeedToBeThrow(resObj.exception)){
						return;
					}
					var readResult = new env.ReadResult(resObj, startTime);
					asyncSuccessFunc(userData, readResult);
				},
				onError: function(_data, statusStr, wrapedXhr){
					reader._setThrowDisbleError(EmErr.HttpError, [wrapedXhr.status], asyncFailureFunc, userData);
				},
				dataType: 'text',
				async: true
			});

			return true;
		})(this, base64img, userData, asyncSuccessFunc, asyncFailureFunc);

	};

	//option relatived
	BarcodeReader.prototype.addPages = function(arrPages) {
		//var funStr = "addPages(Array arrPages): ";
		if(arguments.length < 1){
			this._setError(EmErr.ParameterNumberUnmatched);
			return false;
		}
		if(!(arrPages instanceof Array)){
			//var es = funStr + "Argument 'arrPages' must be a instance of Array. ";
			this._setError(EmErr.TypeNotValid, ['arrPages']);
			return false;
		}
		arrPages = arrPages.slice(); // copy the arr, const original arr
		for(var i = 0; i < arrPages.length; ++i){
			if(typeof arrPages[i] != 'number'){
				this._setError(EmErr.PageNumberInvalid);
				return false;
			}
			arrPages[i] = Math.round(arrPages[i]);
			if(!isNNInt(arrPages[i])){
				//var es = funStr + "elements in the array should be integers in [0, 0x7fffffff]. ";
				this._setError(EmErr.PageNumberInvalid);
				return false;
			}
		}
		this.Pages = this.Pages.concat(arrPages);
		this.Pages.sort();
		var arr = [];
		if(this.Pages.length){
			arr[0] = this.Pages[0];
		}
		for(var i = 1, j = 1; j < this.Pages.length; ++j){
			if(this.Pages[j] != arr[i-1]){
				arr[i] = this.Pages[j];
				++i;
			}
		}
		this.Pages = arr;

		return true;
	};
	BarcodeReader.prototype.clearAllPages = function() {
		this.Pages = [];
		return true;
	};
	BarcodeReader.prototype.addRegion = function() {
		if(arguments.length >= 5){
			// addRegion(int left, int top, int right, int bottom, bool isPercentage)
			//var funStr = "addRegion(int left, int top, int right, int bottom, bool isPercentage): ";
			var isPercentage = arguments[4];
			if(typeof isPercentage != 'boolean'){
				//var es = funStr + /*"The most matching function has some a*/"Arguments error. Argument 'isPercentage' must be a boolean. ";
				this._setError(EmErr.TypeNotValid, ['isPercentage']);
				return false;
			}
			var parameterNames = ['left', 'top', 'right', 'bottom'];
			for(var i = 0; i < 4; ++i){
				if(typeof arguments[i] != 'number'){
					this._setError(EmErr.TypeNotValid, [parameterNames[i]]);
					return false;
				}
				arguments[i] = Math.round(arguments[i]);
				if(!isNNInt(arguments[i]) || (arguments[4]? arguments[i]>100: false)){
					//var es = funStr + /*"The most matching function has some a*/"Arguments error. Argument 'left', 'top', 'right' and 'bottom' must be a integer in [0, 0x7fffffff] when isPercentage is false, in [0, 100] when isPercentage is true. ";
					//this._setError(EmErr.ValueNotValid, [parameterNames[i]]);
					this._setError(EmErr.CustomedRegionInvalid);
					return false;
				}
			}
			var left = arguments[0], 
				top = arguments[1], 
				right = arguments[2], 
				bottom = arguments[3];
			if(left >= right || top >= bottom){
				//var es = funStr + /*"The most matching function has some a*/"Arguments error. Argument 'left' must small than 'right', and 'top' must small than 'bottom'. ";
				this._setError(EmErr.CustomedRegionInvalid);
				return false;
			}
			this.Regions.push(new Region(left, top, right, bottom, isPercentage));
			return true;
		}else if(arguments.length >= 2){
			// addRegion(EnumScanRegionSide emSide, int percentage)
			var emSide = arguments[0],
				percentage =arguments[1];
			if(typeof percentage != 'number'){
				this._setError(EmErr.TypeNotValid, ['percentage']);
				return false;
			}
			percentage = Math.round(percentage);
			if(!isPosInt(percentage) || percentage > 100){
				//var es = funStr + /*"The most matching function has some a*/"Arguments error. Argument 'percentage' must be a integer in [0, 100]. ";
				//this._setError(EmErr.ValueNotValid, ['percentage']);
				this._setError(EmErr.CustomedRegionInvalid);
				return false;
			}
			// arrRegion
			var arr = new Array(0,0,100,100,true);
			var isValid = true;
			var EmSRS = env.EnumScanRegionSide;
			if(emSide === EmSRS.ESRS_Left){
				arr[2] = percentage;
			}else if(emSide === EmSRS.ESRS_Top){
				arr[3] = percentage;
			}else if(emSide === EmSRS.ESRS_Right){
				arr[0] = 100 - percentage;
			}else if(emSide === EmSRS.ESRS_Bottom){
				arr[1] = 100 - percentage;
			}else{
				isValid = false;
			}
			// for(var item in env.EnumScanRegionSide){
			// 	if(env.EnumScanRegionSide[item] === emSide){
			// 		isValid = true;
			// 		break;
			// 	}
			// }
			//var funStr = "addRegion(EnumScanRegionSide emSide, int percentage): ";
			if(!isValid){
				//var es = funStr + /*"The most matching function has some a*/"Arguments error. Argument 'emSide' must be a enum item in EnumScanRegionSide. ";
				//this._setError(EmErr.ValueNotValid, ['emSide']);
				this._setError(EmErr.CustomedRegionInvalid);
				return false;
			}
			this.Regions.push(new Region(arr[0], arr[1], arr[2], arr[3], arr[4]));
			return true;
		}else{
			this._setError(EmErr.ParameterNumberUnmatched);
			return false;
		}
	}; 
	BarcodeReader.prototype.clearAllRegions = function() {
		this.Regions = [];
		return true;
	}; 
	BarcodeReader.prototype.addAngleRange = function(fromAngle, toAngle) {
		if(arguments.length < 2){
			this._setError(EmErr.ParameterNumberUnmatched);
			return false;
		}
		if(typeof fromAngle != 'number'){
			this._setError(EmErr.TypeNotValid, ['fromAngle']);
			return false;
		}
		if(typeof toAngle != 'number'){
			this._setError(EmErr.TypeNotValid, ['toAngle']);
			return false;
		}
		fromAngle = Math.round(fromAngle);
		toAngle = Math.round(toAngle);
		//var funStr = "addAngleRange(int fromAngle, int toAngle): ";
		//var es = funStr + "Argument 'fromAngle' and 'toAngle' must be a integer in [-0x80000000, 0x7fffffff] (int64). ";// in [0, 360]. ";
		//(!isNNInt(fromAngle) || fromAngle > 360 || !isNNInt(toAngle) || toAngle > 360){
		if(!isInt(fromAngle)){
			this._setError(EmErr.ValueNotValid, ['fromAngle']);
			return false;
		}
		if(!isInt(toAngle)){
			this._setError(EmErr.ValueNotValid, ['toAngle']);
			return false;
		}
		this.AngleRanges.push(new AngleRange(fromAngle, toAngle));
		return true;
	};
	BarcodeReader.prototype.addAngle = function(emType) {
		if(arguments.length < 1){
			this._setError(EmErr.ParameterNumberUnmatched);
			return false;
		}
		if(emType == env.EnumBarcodeOrientationType.EBOT_Horizontal){
			this.AngleRanges.push(new AngleRange(315, 45));
			this.AngleRanges.push(new AngleRange(135, 225));
			return true;
		}else if(emType == env.EnumBarcodeOrientationType.EBOT_Vertical){
			this.AngleRanges.push(new AngleRange(45, 135));
			this.AngleRanges.push(new AngleRange(225, 315));
			return true;
		}else{
			//var funStr = "addAngle(EnumBarcodeOrientationType emType): ";
			//var es = funStr + "Argument 'emType' must be a enum of EnumBarcodeOrientationType. ";
			this._setError(EmErr.ValueNotValid, ['emType']);
			return false;
		}
	};
	BarcodeReader.prototype.clearAllAngles = function() {
		this.AngleRanges = [];
		return true;
	}; 
	BarcodeReader.prototype._checkAndRepairOption = function(failureFunc, userData, bNotThrow){

		if(typeof this.barcodeFormats != 'number'){
			this._setError(EmErr.TypeNotValid, ['barcodeFormats'], failureFunc, userData, bNotThrow);
			return false;
		}
		this.barcodeFormats = Math.round(this.barcodeFormats);
		if(!isUSInt(this.barcodeFormats)){
			//this._setError(EmErr.ValueNotValid, ['barcodeFormats'], failureFunc, userData, bNotThrow);
			this._setError(EmErr.BarcodeFormatInvalid, null, failureFunc, userData, bNotThrow);
			return false;
		}

		if(typeof this.maxBarcodesNumPerPage != 'number'){
			this._setError(EmErr.TypeNotValid, ['maxBarcodesNumPerPage'], failureFunc, userData, bNotThrow);
			return false;
		}
		this.maxBarcodesNumPerPage = Math.round(this.maxBarcodesNumPerPage);
		if(!isPosInt(this.maxBarcodesNumPerPage)){
			this._setError(EmErr.MaxBarcodeNumberInvalid);
			return false;
		}

		if(typeof this.timeoutPerPage != 'number'){
			this._setError(EmErr.TypeNotValid, ['timeoutPerPage'], failureFunc, userData, bNotThrow);
			return false;
		}
		this.timeoutPerPage = Math.round(this.timeoutPerPage);
		if(!isPosInt(this.timeoutPerPage)){
			this._setError(EmErr.ValueNotValid, ['timeoutPerPage'], failureFunc, userData, bNotThrow);
			return false;
		}

		if(this.useOneDDeblur == true){// like 1, '1'
			this.useOneDDeblur = true;
		}else if(this.useOneDDeblur == false){// like 0, '0'
			this.useOneDDeblur = false;
		}else{
			this._setError(EmErr.ValueNotValid, ['useOneDDeblur'], failureFunc, userData, bNotThrow);
			return false;
		}

		if(!env._isInEnum(this.imageCaptureDevice, env.EnumImageCaptureDevice)){
			this._setError(EmErr.ValueNotValid, ['imageCaptureDevice'], failureFunc, userData, bNotThrow);
			return false;
		}

		if(!env._isInEnum(this.barcodeColorMode, env.EnumBarcodeColorMode)){
			this._setError(EmErr.ValueNotValid, ['barcodeColorMode'], failureFunc, userData, bNotThrow);
			return false;
		}

		if(!env._isInEnum(this.barcodeTextEncoding, env.EnumBarcodeTextEncoding)){
			this._setError(EmErr.ValueNotValid, ['barcodeTextEncoding'], failureFunc, userData, bNotThrow);
			return false;
		}

		return true;
	};
	BarcodeReader.prototype._toServiceStr = function(){

		var tempObj = {};
		tempObj.UseOneDDeblur = this.useOneDDeblur ? 1 : 0 ;  
		tempObj.ImageCaptureDevice = this.imageCaptureDevice;
		tempObj.BarcodeFormats = this.barcodeFormats;
		tempObj.MaxBarcodesNumPerPage = this.maxBarcodesNumPerPage;
		tempObj.TimeoutPerPage = this.timeoutPerPage;
		tempObj.BarcodeColorMode = this.barcodeColorMode;
		tempObj.BarcodeTextEncoding = this.barcodeTextEncoding; 
		tempObj.Pages = this.Pages;
		tempObj.Regions = this.Regions;
		tempObj.AngleRanges = this.AngleRanges;

		return '"'+lib.stringify(tempObj).replace(/"/g,"'")+'"';
	}
	BarcodeReader.prototype._setError = function(errorCode, info, failureFunc, userData, bNotThrow){
		// info can be array for replace {0}, {1} 
		// or string for set errorStr
		// or null / undefined

		var es = ErrStr[errorCode];
		if(typeof es == 'undefined'){
			info.unshift(errorCode);
			errorCode = EmErr.ServiceInternalError;
			es = ErrStr[errorCode];
		}
		this.errorCode = errorCode;
		if(typeof info != 'undefined' && info != null){
			if(info instanceof Array){
				for(var i = 0; i < info.length; ++i){
					es = es.replace("{"+i+"}", info[i]);
				}
			}else if(typeof info == 'string'){
				es = info;
			}
		}
		this.errorStr = es;
		if(isErrNeedToBeThrow(errorCode)){
			if(!bNotThrow && dynamsoft.dbrEnv.ifThrowException) throw new Error(es);
			if(failureFunc)failureFunc(userData, errorCode, es);
		}
	};
	// when use async, throw is not a good choice but failure callback
	BarcodeReader.prototype._setThrowDisbleError = function(errorCode, info, failureFunc, userData){
		this._setError(errorCode, info, failureFunc, userData, true);
	};
	BarcodeReader.prototype.getErrorCode = function(){
		return this.errorCode;
	};
	BarcodeReader.prototype.getErrorString = function(){
		return this.errorStr;
	}

	env.BarcodeReader = BarcodeReader;
	env._barcodeReaderLoaded = true;
})(dynamsoft.dbrEnv, dynamsoft.lib);

/**
* class ReadResult
*/
(function(env, lib){
	if(env._readResultLoaded){
		return;
	}

	var ReadResult = function(resObj, startTime){
		//myLog(lib.stringify(resObj));
		this.length = 0;// for ie6~9
		if(resObj.result instanceof Array){//lib.isArray(resObj.result)){
		//myLog(lib.stringify(resObj.result[0]));
    		if(dynamsoft.navInfo.bIE && parseInt(dynamsoft.navInfo.strBrowserVersion) <= 9){
    			for(var i = 0; i < resObj.result.length; ++i){
	    			this[i] = resObj.result[i];
	    			++this.length;
	    		}
    		}else{
		    	for(var i = 0; i < resObj.result.length; ++i){
		    		this.push(resObj.result[i]);
		    		/*var resItem = this[i];
		    		resItem.X1 = resItem.point[0];
		    		resItem.X2 = resItem.point[1];
		    		resItem.X3 = resItem.point[2];
		    		resItem.X4 = resItem.point[3];
		    		resItem.Y1 = resItem.point[4];
		    		resItem.Y2 = resItem.point[5];
		    		resItem.Y3 = resItem.point[6];
		    		resItem.Y4 = resItem.point[7];*/
		    	}
	    	}
		}
	    this.exception = resObj.exception;
	    this.description = resObj.description;
	    this.readTime = resObj.duration ? resObj.duration : 0;
	    this.totalTime = (new Date()).getTime() - startTime;
	    //myLog(lib.stringify(this));
	}
	// ReadResult extend Array
	if(!(dynamsoft.navInfo.bIE && parseInt(dynamsoft.navInfo.strBrowserVersion) <= 9)){
		var EmptyClass = function(){};
		EmptyClass.prototype = Array.prototype;
		ReadResult.prototype = new EmptyClass();
	}

	ReadResult.prototype.constructor = ReadResult;
	// ReadResult.prototype.getErrorCode = function(){
	// 	return this.exception;
	// };
	// ReadResult.prototype.getErrorString = function(){
	// 	return this.description;
	// };
	ReadResult.prototype.getCount = function(){
		return this.length;
	};
	ReadResult.prototype.get = function(index){
		return this[index];
	} 

	env.ReadResult = ReadResult;
	env._readResultLoaded = true;
})(dynamsoft.dbrEnv, dynamsoft.lib);
























