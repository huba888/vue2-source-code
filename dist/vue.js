(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // 对模板进行编译处理
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); //<div
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // </div>
  // 匹配属性 name = 123 name = "123" name = '123'
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)+|([^'])'+|([^\s"'=<>`]+)))?/;
  // <div> <br/>
  var startTagClose = /^\s*(\/?)>/;
  // {{ name }}
  function parseHTML(html) {
    function advance(n) {
      html = html.substring(n);
    }
    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1],
          // 标签名字
          attrs: []
        };
        advance(start[0].length);
        // 如果不是开始标签的结束,就一直匹配下去
        var attr, _end;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          } || true);
        }
        if (_end) {
          advance(_end[0].length);
        }
        // console.log(match)
        return match;
      }
      // 不是开始标签 可能 是一个结束标签
      return false;
    }
    var stack = [];
    var currentParent;
    var root;
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        attrs: attrs,
        type: ELEMENT_TYPE,
        parent: null,
        children: []
      };
    }
    function start(tag, attrs) {
      var node = createASTElement(tag, attrs);
      if (!root) {
        root = node;
      }
      if (currentParent) {
        currentParent.children.push(node);
        node.parent = currentParent;
      }
      currentParent = node;
      stack.push(node);
    }
    function chars(text) {
      // text = text.replace(/\s{2,}/g," ")
      text = text.replace(/\s/g, "");
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text
      });
    }
    function end() {
      stack.pop(); // 这里可以检验标签的合法性
      currentParent = stack[stack.length - 1];
    }
    // 如果textEnd = 0 说明是一个开始标签 或者 是一个结束标签
    // 如果textEnd > 0 说明是文本的接触位置
    while (html) {
      var textEnd = html.indexOf("<");
      if (textEnd == 0) {
        // 可能是开始标签
        var startTagMatch = parseStartTag(); // 开始标签的
        if (startTagMatch) {
          // 解析到的开始标签
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        // 可能是结束标签
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          end();
          advance(endTagMatch[0].length);
          continue;
        }
      }
      // 文本
      if (textEnd > 0) {
        var text = html.substring(0, textEnd); // 解析到的文本
        if (text) {
          chars(text);
          advance(text.length);
        }
      }
    }
    return root;
  }

  function compileToFunction(template) {
    // 1.将template 进行 转换为 Ast 语法树
    var ast = parseHTML(template);
    // 2.生成 render方法 (render方法返回的结果就是 虚拟DOM)
    // code = _c("div",{id:"app"},_c("div",{name:"huba"},_v(_s(name)+"hello")))
    var code = codegen(ast);
    code = "with(this){return ".concat(code, "}");
    var render = new Function(code);
    return render;
  }
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  function gen(node) {
    // 如果是元素
    if (node.type === 1) {
      return codegen(node);
    } else {
      // 文本
      var text = node.text;
      if (!defaultTagRE.test(text)) {
        // 纯文本
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        // {{name}}  _v(_s(name) + "hello" + _s(name))
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;
        while (match = defaultTagRE.exec(text)) {
          var index = match.index; // 匹配的位置
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return "_v(".concat(tokens.join("+"), ")");
      }
    }
  }
  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(",");
  }
  function getProps(attrs) {
    var str = ""; // {name,value}
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      if (attr.name == "style") {
        (function () {
          var obj = {};
          attr.value.split(";").forEach(function (item) {
            var _item$split = item.split(":"),
              _item$split2 = _slicedToArray(_item$split, 2),
              key = _item$split2[0],
              value = _item$split2[1];
            obj[key] = value;
          });
          attr.value = obj;
        })();
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? getProps(ast.attrs) : "null").concat(ast.children.length ? ",".concat(children) : "", ")");
    return code;
  }

  // h() _c()
  // 创建元素的虚拟节点
  function createElementVNode(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    if (data == null) {
      data = {};
    }
    var key = data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return vnode(vm, tag, key, data, children);
  }
  // _v()
  // 创建元素的虚拟节点
  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }
  // 那不是和ast差不多了吗？
  // ast 做的是语法层面的转换,他描述的是语法本身（ast 可以描述js css html）等等
  // vnode 虚拟节点 描述的是dom元素 可以增加一些自定义的元素(描述dom)
  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  // 这个函数有初次渲染的功能,又有更新的功能
  function createElm(vnode) {
    var tag = vnode.tag,
      data = vnode.data,
      children = vnode.children,
      text = vnode.text;
    if (typeof tag == "string") {
      vnode.el = document.createElement(tag); // 这里将真实节点将虚拟节点对应起来 后续如果修改属性
      // 更新属性
      patchProps(vnode.el, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }
  function patchProps(el, props) {
    for (var key in props) {
      if (key == "style") {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
  function patch(oldNode, vnode) {
    // nodeType是原生的方法 判断是初次渲染还是跟新
    var isRealElement = oldNode.nodeType;
    if (isRealElement) {
      // 初次渲染
      var elm = oldNode; // 获取真实元素
      var parentElm = elm.parentNode; //拿到父元素
      // 通过虚拟DOM生成了真实的DOM
      var newElm = createElm(vnode);
      // console.log(newElm)
      parentElm.insertBefore(newElm, elm.nextSibling);
      // 删除老节点
      parentElm.removeChild(elm);
      return newElm;
    }
  }
  function initLifeCycle(Vue) {
    // _render == vm.$options.render 执行之后生成虚拟Dom
    Vue.prototype._render = function () {
      var vm = this;
      return vm.$options.render.call(vm); // 通过ast语法转换之后生成的render方法
    };
    // 虚拟Dom变为真实Dom的方法
    Vue.prototype._update = function (vnode) {
      var el = this.$el;
      // patch既有跟新的功能,又有初始化的功能
      this.$el = patch(el, vnode);
    };
    // _c("div",{},...children)
    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    // _v(text)
    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    // 值转字符串
    Vue.prototype._s = function (value) {
      if (_typeof(value) !== "object") return value;
      return JSON.stringify(value);
    };
  }

  // 组件的挂载
  function mountComponnent(vm, el) {
    // 1.调用reander 生成虚拟DOM
    // 2.根据虚拟DOM 生成 真实DOM
    // 3.插入到el元素中
    vm.$el = el;
    vm._update(vm._render()); // vm.$options.render() -> 虚拟节点
  }

  // Vue的核心流程
  // 1.创建了响应式数据
  // 2.模板转换为ast
  // 3.将ast语法树转为render函数
  // 后续数据的更新可以只是执行render函数 (无需再次执行ast的转换)
  // render函数会去生成虚拟节点
  // 根据生成的虚拟节点创造真实的DOM

  var oldArrayProto = Array.prototype;
  var newArrayProto = Object.create(oldArrayProto);
  var methods = ["push", "shift", "pop", "unshift", "sort", "reverse", "splice"];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      // 对函数的一个劫持
      var res = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args));
      // 但是..args里面的内容也可能是对象或者是数组 还需要进行观测
      var inserted;
      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
        case "splice":
          inserted = args.slice(2);
      }
      if (inserted) {
        // 对新增加的数据再次进行观测
        this.__ob__.observeArray(inserted);
      }
      return res;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);
      // Object.defineProperty 执行劫持已经存在的属性(vue2 中会为此单独写一些Api $set $delete)
      // data.__ob__ = this 这样会死循环
      Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false
      });
      if (Array.isArray(data)) {
        // 如果是数组
        Object.setPrototypeOf(data, newArrayProto);
        this.observeArray(data);
      } else {
        // 如果是对象
        this.walk(data);
      }
    }
    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        // 让这个data循环 // 对对象的一个方法
        // 重新定义属性
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);
    return Observe;
  }();
  function defineReactive(target, key, value) {
    observe(value);
    Object.defineProperty(target, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        observe(newValue);
        value = newValue;
      }
    });
  }
  // 观测对象的方法
  function observe(data) {
    // 只对象进行劫持
    if (_typeof(data) !== "object" || data == null) {
      return;
    }
    if (data.__ob__ instanceof Observe) {
      return data.__ob__;
    }
    // 如果一个对象被劫持了，那就不需要再次劫持了(要判断一个对象是否被劫持过,用实例来判断对象是否被劫持过)
    new Observe(data);
  }

  function initState(vm) {
    var opts = vm.$options;
    if (opts.data) {
      initData(vm);
    }
  }
  function initData(vm) {
    var data = vm.$options.data; // data可能是函数 也可能是对象
    data = typeof data === "function" ? data.call(this) : data;

    // 对数据进行劫持 vue2里面使用了一个api defineProperty
    vm._data = data;
    observe(data);
    for (var key in data) {
      proxy(vm, "_data", key);
    }
  }
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }

  function initMixin(Vue) {
    // 给Vue 增加init方法的
    Vue.prototype._init = function (options) {
      // 用于初始化操作
      var vm = this;
      vm.$options = options;
      // 初始化状态
      initState(vm);

      // 挂载
      if (options.el) {
        vm.$mount(options.el); //数显数据的挂在
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var ops = vm.$options;
      el = document.querySelector(el);
      // 先判断有没有render函数
      // 如果没有 就看一下是否写了template选项 和 有el
      // render > template > el.outerHtml
      var template;
      if (!ops.render) {
        if (!ops.template && el) {
          // 没有写模板,但是写了el
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template;
          }
        }
      }
      // 写了template 就用 写了的template
      // template = <div></div>
      if (template && el) {
        // 如果有模板 那就进行编译
        var render = compileToFunction(template);
        ops.render = render;
      }
      // 最后一定会有一个 ops.render
      mountComponnent(vm, el); // 组件的挂载
    };
  }

  function Vue(options) {
    this._init(options);
  }
  initMixin(Vue);
  initLifeCycle(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
