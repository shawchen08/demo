(function(window, NS) {
    /** @const */
    var widgetName = 'Carousel',
        doc = window.document;

    var _uid = 0,
        _opts,
        timer;

    var template = {
        main: '<span class="carousel-arrow prev">&lt;</span><span class="carousel-arrow next">&gt;</span>${content}',
        ul: '<ul class="carousel-${type}">${items}</ul>',
        item: '<li class="carousel-item"><img class="carousel-item-img" src="${src}" alt="${text}" /></li>',
        dot: '<li class="carousel-dot-item ${cls}"></li>'
    };
    var utils = {
        /**
         * 设置唯一标识
         * @param {String} prefix 标识前缀
         */
        setUid: function(/*optional*/prefix) {
            return (prefix || '') + _uid++;
        },
        /**
         * 替换模版字符串
         * @param  {String} tpl  待处理模版字符串
         * @param  {Array} args  
         * @return {String}      替换好的模版字符串
         */
        templateFormat: function(tpl, args) {
            var index = 0;
            return tpl.replace(/\$\{\w+\}/g, function(str) {
                return args[index++];
            });
        },
        /**
         * 连字符分隔法命名与驼峰法命名互相转换
         * @param  {String}  name      
         * @param  {Boolean} isReverse   true转为驼峰法命名，false反之
         * @return {String}
         */
        toCamel: function(name, isReverse) {
            if (!isReverse) {
                return name.replace(/[A-Z]/g, function(str, index) {
                    var newStr = str.toLowerCase();
                    if (index) {
                        newStr = '-' + newStr;
                    }
                    return newStr;
                });
            } else {
                return name.replace(/-[a-z]{1}/g, function(str) {
                    return str.charAt(1).toUpperCase();
                });
            }
        },
        on: function(target, eventType, callback) {
            if (target.addEventListener) {   //非ie 和ie9及以上
                target.addEventListener(eventType, callback, false);
            } else if (target.attachEvent) { //ie6到ie8  
                target.attachEvent('on' + eventType, callback);
            } else {                         //早期浏览器  
                target['on' + eventType] = callback;
            }
        },
        off: function(target, eventType, callback) {
            if (target.removeEventListener) {
                target.removeEventListener(eventType, callback, false);
            } else if (target.detachEvent) {
                target.detachEvent('on' + eventType, callback);
            } else {
                target['on' + eventType] = null;
            }
        },
        stringToDom: function(str) {
            var tempDom = doc.createElement('div'),
                dom;
            tempDom.innerHTML = str;
            dom = tempDom.children[0];
            tempDom = null;
            return dom;
        },
        removeChild: function(dom) {
            if(dom) {
                dom.parentNode.removeChild(dom);
            }
        },
        hasClass: function(el, className) {
            if(el && el.nodeType === 1 && className) {
                var hasClass;
                el.className.split(' ').forEach(function(val) {
                    if(val === className) {
                        hasClass = true;
                    }
                });
                return hasClass;
            }
        },
        addClass: function(el, className) {
            if(el && el.nodeType === 1 && className) {
                if(!this.hasClass(el, className)) {
                    el.className += (' ' + className);
                }
            }
        },
        removeClass: function(el, className) {
            if(el && el.nodeType === 1 && className) {
                if(this.hasClass(el, className)) {
                    var arr = el.className.split(' '),
                        index;
                    arr.forEach(function(val, i) {
                        if(val === className) {
                            index = i;
                        }
                    });
                    arr.splice(index, 1);
                    el.className = arr.join(' ');
                }
            }
        },
        index: function(el) {
            var index = 0;
            if (!el || !el.parentNode) {
                return -1;
            }
            while (el && (el = el.previousElementSibling)) {
                index++;
            }
            return index;
        },
        extend: function(dst, src) {
            if (dst && src) {
                for (var key in src) {
                    if (src.hasOwnProperty(key)) {
                        dst[key] = src[key];
                    }
                }
            }
            return dst;
        }
    };
    function _prev(width, index, totalML, mLeft, number) {
        var num = number || -1;
        if(mLeft === 0) {
            _opts.listBox.style.marginLeft = totalML + 'px';
            utils.removeClass(_opts.dots[0], 'on');
            utils.addClass(_opts.dots[_opts.count - 1], 'on');
        } else {
            _opts.listBox.style.marginLeft = mLeft - num * width + 'px';
            utils.removeClass(_opts.dots[index], 'on');
            utils.addClass(_opts.dots[index + num], 'on');
        }
    }
    function _next(width, index, totalML, mLeft, number) {
        var num = number || 1;
        if(mLeft === totalML) {
            _opts.listBox.style.marginLeft = '';
            utils.removeClass(_opts.dots[_opts.count - 1], 'on');
            utils.addClass(_opts.dots[0], 'on');
        } else {
            _opts.listBox.style.marginLeft = mLeft - num * width + 'px';
            utils.removeClass(_opts.dots[index], 'on');
            utils.addClass(_opts.dots[(index + num) % _opts.count], 'on');
        }
    }
    function _play(e) {
        var el = e.currentTarget,
            width = _opts.width,
            listBoxML = parseFloat(_opts.listBox.style.marginLeft),
            mLeft = isNaN(listBoxML) ? 0 : listBoxML,
            totalML = (1 - _opts.count) * width,
            index = -mLeft / width;

        if(utils.hasClass(el, 'prev')) { 
            _prev(width, index, totalML, mLeft);
        } else if(utils.hasClass(el, 'next')) {
            _next(width, index, totalML, mLeft);
        } else if(utils.hasClass(el, 'carousel-dot-item')) {
            var num = utils.index(el) - index;
            if(num) {
                var fn = num < 0 ? _prev : _next;
                fn(width, index, totalML, mLeft, num);
            }
        }
    }
    function _autoPaly() {
        var width = _opts.width,
            listBoxML = parseFloat(_opts.listBox.style.marginLeft),
            mLeft = isNaN(listBoxML) ? 0 : listBoxML,
            totalML = (1 - _opts.count) * width,
            index = -mLeft / width,
            fn = _opts.isReverse ? _prev : _next;
        
        fn(width, index, totalML, mLeft);

    }
    function _setInterval() {
        timer = setInterval(_autoPaly, _opts.duration);
    }
    function _clearInterval() {
        clearInterval(timer);
    }
    function _create(opts) {
        var data = opts.data,
            index = opts.curIndex,
            dotTpl = '',
            itemTpl = '',
            pos, style, i;

        data.forEach(function(el, i) {
            cls = (i + 1 === index) ? 'on' : '';
            dotTpl += utils.templateFormat(template.dot, [cls]);
            itemTpl += utils.templateFormat(template.item, [el.image, el.text]);
        });

        opts.root.innerHTML = utils.templateFormat(template.main, [
            utils.templateFormat(template.ul, ['dot', dotTpl]) + utils.templateFormat(template.ul, ['list', itemTpl])
        ]);

        pos = opts.root.getBoundingClientRect();
        opts.count = data.length;
        opts.width = pos.width;
        opts.height = pos.height;

        opts.listBox = opts.root.querySelector('.carousel-list');
        style = opts.listBox.style;
        style.width = pos.width * opts.count + 'px';
        style.height = pos.height + 'px';
        style.marginLeft = (1 - index) * pos.width + 'px';

        opts.prev = opts.root.querySelector('.prev');
        opts.next = opts.root.querySelector('.next');
        opts.dots = opts.root.querySelectorAll('.carousel-dot-item ');

        //内部全局变量
        _opts = opts;

        utils.on(opts.prev, 'click', _play);
        utils.on(opts.next, 'click', _play);
        for(i = 0; i < opts.count; i++) {
            utils.on(opts.dots[i], 'click', _play);
        }

        if(opts.isAuto) {
            _setInterval();
            utils.on(opts.root, 'mouseover', _clearInterval);
            utils.on(opts.root, 'mouseout', _setInterval);
        }
    }
    function Widget(container, options) {
        this.container = doc.querySelector(container);
        if(!this.container) {
            return;
        }
        this.name = widgetName;
        this.uid = utils.setUid();
        this.defaults = {
            data: [],
            curIndex: 1,
            isAuto: true,
            isReverse: false,
            duration: 3000
        };
        // this.options = Object.assign({}, this.defaults, options);
        this.options = utils.extend(this.defaults, options);
        this.options.root = doc.createElement('div');
        this.options.root.className = 'ch-' + utils.toCamel(widgetName, false);

        this.init();
    }
    Widget.prototype = {
        constructor: Widget,
        init: function() {
            var opts = this.options;

            this.container.innerHTML = '';
            this.container.appendChild(opts.root);
            _create(opts);
        },
        setData: function(data) {
            this.options.data = data;
            this.init();
        },
        destroy: function() {
            //解绑事件,清除定时器
            if(_opts.isAuto) {
                utils.off(_opts.root, 'mouseout', _setInterval);
                utils.off(_opts.root, 'mouseover', _clearInterval);
                _clearInterval();
            }
            utils.off(_opts.prev, 'click', _play);
            utils.off(_opts.next, 'click', _play);
            for(i = 0; i < _opts.count; i++) {
                utils.off(_opts.dots[i], 'click', _play);
            }

            _uid = _opts = timer = doc = widgetName = template = utils = null;
            this.container.innerHTML = '';
        }
    };
    NS[widgetName] = Widget;
}(window, window.NS || (window.NS = {})));