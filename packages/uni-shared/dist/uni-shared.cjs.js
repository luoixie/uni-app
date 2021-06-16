'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var shared = require('@vue/shared');

function formatKey(key) {
    return shared.camelize(key.substring(5));
}
function initCustomDataset() {
    const prototype = HTMLElement.prototype;
    const setAttribute = prototype.setAttribute;
    prototype.setAttribute = function (key, value) {
        if (key.startsWith('data-') && this.tagName.startsWith('UNI-')) {
            const dataset = this.__uniDataset ||
                (this.__uniDataset = {});
            dataset[formatKey(key)] = value;
        }
        setAttribute.call(this, key, value);
    };
    const removeAttribute = prototype.removeAttribute;
    prototype.removeAttribute = function (key) {
        if (this.__uniDataset &&
            key.startsWith('data-') &&
            this.tagName.startsWith('UNI-')) {
            delete this.__uniDataset[formatKey(key)];
        }
        removeAttribute.call(this, key);
    };
}
function getCustomDataset(el) {
    return shared.extend({}, el.dataset, el.__uniDataset);
}

const unitRE = new RegExp(`"[^"]+"|'[^']+'|url\\([^)]+\\)|(\\d*\\.?\\d+)[r|u]px`, 'g');
function toFixed(number, precision) {
    const multiplier = Math.pow(10, precision + 1);
    const wholeNumber = Math.floor(number * multiplier);
    return (Math.round(wholeNumber / 10) * 10) / multiplier;
}
const defaultRpx2Unit = {
    unit: 'rem',
    unitRatio: 10 / 320,
    unitPrecision: 5,
};
function createRpx2Unit(unit, unitRatio, unitPrecision) {
    // ignore: rpxCalcIncludeWidth
    return (val) => val.replace(unitRE, (m, $1) => {
        if (!$1) {
            return m;
        }
        const value = toFixed(parseFloat($1) * unitRatio, unitPrecision);
        return value === 0 ? '0' : `${value}${unit}`;
    });
}

function passive(passive) {
    return { passive };
}
function normalizeDataset(el) {
    // TODO
    return JSON.parse(JSON.stringify(el.dataset || {}));
}
function normalizeTarget(el) {
    const { id, offsetTop, offsetLeft } = el;
    return {
        id,
        dataset: getCustomDataset(el),
        offsetTop,
        offsetLeft,
    };
}
function addFont(family, source, desc) {
    const fonts = document.fonts;
    if (fonts) {
        const fontFace = new FontFace(family, source, desc);
        return fontFace.load().then(() => {
            fonts.add(fontFace);
        });
    }
    return new Promise((resolve) => {
        const style = document.createElement('style');
        const values = [];
        if (desc) {
            const { style, weight, stretch, unicodeRange, variant, featureSettings } = desc;
            style && values.push(`font-style:${style}`);
            weight && values.push(`font-weight:${weight}`);
            stretch && values.push(`font-stretch:${stretch}`);
            unicodeRange && values.push(`unicode-range:${unicodeRange}`);
            variant && values.push(`font-variant:${variant}`);
            featureSettings && values.push(`font-feature-settings:${featureSettings}`);
        }
        style.innerText = `@font-face{font-family:"${family}";src:${source};${values.join(';')}}`;
        document.head.appendChild(style);
        resolve();
    });
}
function scrollTo(scrollTop, duration) {
    if (shared.isString(scrollTop)) {
        const el = document.querySelector(scrollTop);
        if (el) {
            scrollTop = el.getBoundingClientRect().top + window.pageYOffset;
        }
    }
    if (scrollTop < 0) {
        scrollTop = 0;
    }
    const documentElement = document.documentElement;
    const { clientHeight, scrollHeight } = documentElement;
    scrollTop = Math.min(scrollTop, scrollHeight - clientHeight);
    if (duration === 0) {
        // 部分浏览器（比如微信）中 scrollTop 的值需要通过 document.body 来控制
        documentElement.scrollTop = document.body.scrollTop = scrollTop;
        return;
    }
    if (window.scrollY === scrollTop) {
        return;
    }
    const scrollTo = (duration) => {
        if (duration <= 0) {
            window.scrollTo(0, scrollTop);
            return;
        }
        const distaince = scrollTop - window.scrollY;
        requestAnimationFrame(function () {
            window.scrollTo(0, window.scrollY + (distaince / duration) * 10);
            scrollTo(duration - 10);
        });
    };
    scrollTo(duration);
}

function plusReady(callback) {
    if (typeof callback !== 'function') {
        return;
    }
    if (window.plus) {
        return callback();
    }
    document.addEventListener('plusready', callback);
}

const BUILT_IN_TAGS = [
    'ad',
    'audio',
    'button',
    'camera',
    'canvas',
    'checkbox',
    'checkbox-group',
    'cover-image',
    'cover-view',
    'editor',
    'form',
    'functional-page-navigator',
    'icon',
    'image',
    'input',
    'label',
    'live-player',
    'live-pusher',
    'map',
    'movable-area',
    'movable-view',
    'navigator',
    'official-account',
    'open-data',
    'picker',
    'picker-view',
    'picker-view-column',
    'progress',
    'radio',
    'radio-group',
    'rich-text',
    'scroll-view',
    'slider',
    'swiper',
    'swiper-item',
    'switch',
    'text',
    'textarea',
    'video',
    'view',
    'web-view',
].map((tag) => 'uni-' + tag);
const TAGS = [
    'app',
    'layout',
    'content',
    'main',
    'top-window',
    'left-window',
    'right-window',
    'tabbar',
    'page',
    'page-head',
    'page-wrapper',
    'page-body',
    'page-refresh',
    'actionsheet',
    'modal',
    'toast',
    'resize-sensor',
    'shadow-root',
].map((tag) => 'uni-' + tag);
function isBuiltInComponent(tag) {
    return BUILT_IN_TAGS.indexOf('uni-' + tag) !== -1;
}
function isCustomElement(tag) {
    return TAGS.indexOf(tag) !== -1 || BUILT_IN_TAGS.indexOf(tag) !== -1;
}
function isNativeTag(tag) {
    return (shared.isHTMLTag(tag) || shared.isSVGTag(tag)) && !isBuiltInComponent(tag);
}
const COMPONENT_SELECTOR_PREFIX = 'uni-';
const COMPONENT_PREFIX = 'v-' + COMPONENT_SELECTOR_PREFIX;

class DOMException extends Error {
    constructor(message) {
        super(message);
        this.name = 'DOMException';
    }
}

function normalizeEventType(type) {
    return `on${shared.capitalize(shared.camelize(type))}`;
}
class UniEvent {
    constructor(type, opts) {
        this.defaultPrevented = false;
        this.timeStamp = Date.now();
        this._stop = false;
        this._end = false;
        this.type = type.toLowerCase();
        this.bubbles = !!opts.bubbles;
        this.cancelable = !!opts.cancelable;
    }
    preventDefault() {
        this.defaultPrevented = true;
    }
    stopImmediatePropagation() {
        this._end = this._stop = true;
    }
    stopPropagation() {
        this._stop = true;
    }
}
class UniEventTarget {
    constructor() {
        this._listeners = {};
    }
    dispatchEvent(evt) {
        const listeners = this._listeners[evt.type];
        if (!listeners) {
            return false;
        }
        const len = listeners.length;
        for (let i = 0; i < len; i++) {
            listeners[i].call(this, evt);
            if (evt._end) {
                break;
            }
        }
        return evt.cancelable && evt.defaultPrevented;
    }
    addEventListener(type, listener, options) {
        const isOnce = options && options.once;
        if (isOnce) {
            const wrapper = function (evt) {
                listener.apply(this, [evt]);
                this.removeEventListener(type, wrapper, options);
            };
            return this.addEventListener(type, wrapper, shared.extend(options, { once: false }));
        }
        (this._listeners[type] || (this._listeners[type] = [])).push(listener);
    }
    removeEventListener(type, callback, options) {
        const listeners = this._listeners[type.toLowerCase()];
        if (!listeners) {
            return;
        }
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }
}

class UniCSSStyleDeclaration {
    constructor() {
        this._cssText = null;
        this._value = null;
    }
    setProperty(property, value) {
        if (value === null || value === '') {
            this.removeProperty(property);
        }
        else {
            if (!this._value) {
                this._value = {};
            }
            this._value[property] = value;
        }
    }
    getPropertyValue(property) {
        if (!this._value) {
            return '';
        }
        return this._value[property] || '';
    }
    removeProperty(property) {
        if (!this._value) {
            return '';
        }
        const value = this._value[property];
        delete this._value[property];
        return value;
    }
    get cssText() {
        return this._cssText || '';
    }
    set cssText(cssText) {
        this._cssText = cssText;
    }
    toJSON() {
        const { _cssText, _value } = this;
        const hasCssText = _cssText !== null;
        const hasValue = _value !== null;
        if (hasCssText && hasValue) {
            return [_cssText, _value];
        }
        if (hasCssText) {
            return _cssText;
        }
        if (hasValue) {
            return _value;
        }
    }
}
const STYLE_PROPS = [
    '_value',
    '_cssText',
    'cssText',
    'getPropertyValue',
    'setProperty',
    'removeProperty',
    'toJSON',
];
function proxyStyle(uniCssStyle) {
    return new Proxy(uniCssStyle, {
        get(target, key, receiver) {
            if (STYLE_PROPS.indexOf(key) === -1) {
                return target.getPropertyValue(key);
            }
            return Reflect.get(target, key, receiver);
        },
        set(target, key, value, receiver) {
            if (STYLE_PROPS.indexOf(key) === -1) {
                target.setProperty(key, value);
                return true;
            }
            return Reflect.set(target, key, value, receiver);
        },
    });
}

const ATTR_MAP = {
    class: '.c',
    style: '.s',
    onClick: '.e0',
    onChange: '.e1',
    onInput: '.e2',
    onLoad: '.e3',
    onError: '.e4',
    onTouchstart: '.e5',
    onTouchmove: '.e6',
    onTouchcancel: '.e7',
    onTouchend: '.e8',
    onLongpress: '.e9',
    onTransitionend: '.ea',
    onAnimationstart: '.eb',
    onAnimationiteration: '.ec',
    onAnimationend: '.ed',
    onTouchforcechange: '.ee',
};
function encodeAttr(name) {
    return ATTR_MAP[name] || name;
}
const COMPONENT_MAP = {
    VIEW: 1,
    IMAGE: 2,
    TEXT: 3,
    '#text': 4,
    '#comment': 5,
    NAVIGATOR: 6,
    FORM: 7,
    BUTTON: 8,
    INPUT: 9,
    LABEL: 10,
    RADIO: 11,
    CHECKBOX: 12,
    'CHECKBOX-GROUP': 13,
    AD: 14,
    AUDIO: 15,
    CAMERA: 16,
    CANVAS: 17,
    'COVER-IMAGE': 18,
    'COVER-VIEW': 19,
    EDITOR: 20,
    'FUNCTIONAL-PAGE-NAVIGATOR': 21,
    ICON: 22,
    'RADIO-GROUP': 23,
    'LIVE-PLAYER': 24,
    'LIVE-PUSHER': 25,
    MAP: 26,
    'MOVABLE-AREA': 27,
    'MOVABLE-VIEW': 28,
    'OFFICIAL-ACCOUNT': 29,
    'OPEN-DATA': 30,
    PICKER: 31,
    'PICKER-VIEW': 32,
    'PICKER-VIEW-COLUMN': 33,
    PROGRESS: 34,
    'RICH-TEXT': 35,
    'SCROLL-VIEW': 36,
    SLIDER: 37,
    SWIPER: 38,
    'SWIPER-ITEM': 39,
    SWITCH: 40,
    TEXTAREA: 41,
    VIDEO: 42,
    'WEB-VIEW': 43,
};
function encodeTag(tag) {
    return COMPONENT_MAP[tag] || tag;
}

const NODE_TYPE_PAGE = 0;
const NODE_TYPE_ELEMENT = 1;
const NODE_TYPE_TEXT = 3;
const NODE_TYPE_COMMENT = 8;
function sibling(node, type) {
    const { parentNode } = node;
    if (!parentNode) {
        return null;
    }
    const { childNodes } = parentNode;
    return childNodes[childNodes.indexOf(node) + (type === 'n' ? 1 : -1)] || null;
}
function removeNode(node) {
    const { parentNode } = node;
    if (parentNode) {
        parentNode.removeChild(node);
    }
}
function checkNodeId(node) {
    if (!node.nodeId) {
        node.nodeId = node.pageNode.genId();
    }
}
// 为优化性能，各平台不使用proxy来实现node的操作拦截，而是直接通过pageNode定制
class UniNode extends UniEventTarget {
    constructor(nodeType, nodeName, container) {
        super();
        this.pageNode = null;
        this.parentNode = null;
        this._text = null;
        if (container) {
            const { pageNode } = container;
            this.pageNode = pageNode;
            this.nodeId = pageNode.genId();
            pageNode.onCreate(this, encodeTag(nodeName));
        }
        this.nodeType = nodeType;
        this.nodeName = nodeName;
        this.childNodes = [];
    }
    get firstChild() {
        return this.childNodes[0] || null;
    }
    get lastChild() {
        const { childNodes } = this;
        const length = childNodes.length;
        return length ? childNodes[length - 1] : null;
    }
    get nextSibling() {
        return sibling(this, 'n');
    }
    get nodeValue() {
        return null;
    }
    set nodeValue(_val) { }
    get textContent() {
        return this._text || '';
    }
    set textContent(text) {
        this._text = text;
        if (this.pageNode) {
            this.pageNode.onTextContent(this, text);
        }
    }
    get parentElement() {
        const { parentNode } = this;
        if (parentNode && parentNode.nodeType === NODE_TYPE_ELEMENT) {
            return parentNode;
        }
        return null;
    }
    get previousSibling() {
        return sibling(this, 'p');
    }
    appendChild(newChild) {
        return this.insertBefore(newChild, null);
    }
    cloneNode(deep) {
        const cloned = shared.extend(Object.create(Object.getPrototypeOf(this)), this);
        const { attributes } = cloned;
        if (attributes) {
            cloned.attributes = shared.extend({}, attributes);
        }
        if (deep) {
            cloned.childNodes = cloned.childNodes.map((childNode) => childNode.cloneNode(true));
        }
        return cloned;
    }
    insertBefore(newChild, refChild) {
        removeNode(newChild);
        newChild.pageNode = this.pageNode;
        newChild.parentNode = this;
        checkNodeId(newChild);
        const { childNodes } = this;
        let index;
        if (refChild) {
            index = childNodes.indexOf(refChild);
            if (index === -1) {
                throw new DOMException(`Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.`);
            }
            childNodes.splice(index, 0, newChild);
        }
        else {
            index = childNodes.length;
            childNodes.push(newChild);
        }
        return this.pageNode
            ? this.pageNode.onInsertBefore(this, newChild, index)
            : newChild;
    }
    removeChild(oldChild) {
        const { childNodes } = this;
        const index = childNodes.indexOf(oldChild);
        if (index === -1) {
            throw new DOMException(`Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.`);
        }
        oldChild.parentNode = null;
        childNodes.splice(index, 1);
        return this.pageNode
            ? this.pageNode.onRemoveChild(this, oldChild)
            : oldChild;
    }
}
class UniBaseNode extends UniNode {
    constructor(nodeType, nodeName, container) {
        super(nodeType, nodeName, container);
        this.attributes = Object.create(null);
        this._html = null;
        this.style = proxyStyle(new UniCSSStyleDeclaration());
    }
    get className() {
        return (this.attributes['class'] || '');
    }
    set className(val) {
        this.setAttribute('class', val);
    }
    get innerHTML() {
        return '';
    }
    set innerHTML(html) {
        this._html = html;
    }
    addEventListener(type, listener, options) {
        super.addEventListener(type, listener, options);
        const normalized = normalizeEventType(type);
        if (!this.attributes[normalized]) {
            this.setAttribute(normalized, 1);
        }
    }
    removeEventListener(type, callback, options) {
        super.removeEventListener(type, callback, options);
        const normalized = normalizeEventType(type);
        if (this.attributes[encodeAttr(normalized)]) {
            this.removeAttribute(normalized);
        }
    }
    getAttribute(qualifiedName) {
        return this.attributes[encodeAttr(qualifiedName)];
    }
    removeAttribute(qualifiedName) {
        qualifiedName = encodeAttr(qualifiedName);
        delete this.attributes[qualifiedName];
        if (this.pageNode) {
            this.pageNode.onRemoveAttribute(this, qualifiedName);
        }
    }
    setAttribute(qualifiedName, value) {
        qualifiedName = encodeAttr(qualifiedName);
        this.attributes[qualifiedName] = value;
        if (this.pageNode) {
            this.pageNode.onSetAttribute(this, qualifiedName, value);
        }
    }
    toJSON(opts = {}) {
        const res = {
            a: this.attributes,
            s: this.style.toJSON(),
        };
        if (!opts.attr) {
            res.i = this.nodeId;
            res.n = encodeTag(this.nodeName);
        }
        if (this._text !== null) {
            res.t = this._text;
        }
        return res;
    }
}

class UniCommentNode extends UniNode {
    constructor(text, container) {
        super(NODE_TYPE_COMMENT, '#comment', container);
        this._text = text;
    }
    toJSON(opts = {}) {
        return opts.attr
            ? { t: this._text }
            : {
                i: this.nodeId,
                t: this._text,
            };
    }
}

class UniElement extends UniBaseNode {
    constructor(nodeName, container) {
        super(NODE_TYPE_ELEMENT, nodeName.toUpperCase(), container);
        this.tagName = this.nodeName;
    }
}
class UniInputElement extends UniElement {
    get value() {
        return this.getAttribute('value');
    }
    set value(val) {
        this.setAttribute('value', val);
    }
}
class UniTextAreaElement extends UniInputElement {
}

class UniTextNode extends UniBaseNode {
    constructor(text, container) {
        super(NODE_TYPE_TEXT, '#text', container);
        this._text = text;
    }
    get nodeValue() {
        return this._text || '';
    }
    set nodeValue(text) {
        this._text = text;
        if (this.pageNode) {
            this.pageNode.onNodeValue(this, text);
        }
    }
}

const DECODED_ATTR_MAP = /*#__PURE__*/ Object.keys(ATTR_MAP).reduce((map, name) => {
    map[ATTR_MAP[name]] = name;
    return map;
}, Object.create(null));
function decodeAttr(name) {
    return DECODED_ATTR_MAP[name] || name;
}
const DECODED_COMPONENT_ARR = /*#__PURE__*/ Object.keys(COMPONENT_MAP).reduce((arr, name) => {
    arr.push(name.toLowerCase());
    return arr;
}, ['']);
function decodeTag(tag) {
    return DECODED_COMPONENT_ARR[tag] || tag;
}

const cacheStringFunction = (fn) => {
    const cache = Object.create(null);
    return ((str) => {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    });
};
function getLen(str = '') {
    return ('' + str).replace(/[^\x00-\xff]/g, '**').length;
}
function removeLeadingSlash(str) {
    return str.indexOf('/') === 0 ? str.substr(1) : str;
}
const invokeArrayFns = (fns, arg) => {
    let ret;
    for (let i = 0; i < fns.length; i++) {
        ret = fns[i](arg);
    }
    return ret;
};
function updateElementStyle(element, styles) {
    for (const attrName in styles) {
        element.style[attrName] = styles[attrName];
    }
}
function once(fn, ctx = null) {
    let res;
    return ((...args) => {
        if (fn) {
            res = fn.apply(ctx, args);
            fn = null;
        }
        return res;
    });
}
const sanitise = (val) => (val && JSON.parse(JSON.stringify(val))) || val;
const _completeValue = (value) => (value > 9 ? value : '0' + value);
function formatDateTime({ date = new Date(), mode = 'date' }) {
    if (mode === 'time') {
        return (_completeValue(date.getHours()) + ':' + _completeValue(date.getMinutes()));
    }
    else {
        return (date.getFullYear() +
            '-' +
            _completeValue(date.getMonth() + 1) +
            '-' +
            _completeValue(date.getDate()));
    }
}
function callOptions(options, data) {
    options = options || {};
    if (typeof data === 'string') {
        data = {
            errMsg: data,
        };
    }
    if (/:ok$/.test(data.errMsg)) {
        if (typeof options.success === 'function') {
            options.success(data);
        }
    }
    else {
        if (typeof options.fail === 'function') {
            options.fail(data);
        }
    }
    if (typeof options.complete === 'function') {
        options.complete(data);
    }
}

const encode = encodeURIComponent;
function stringifyQuery(obj, encodeStr = encode) {
    const res = obj
        ? Object.keys(obj)
            .map((key) => {
            let val = obj[key];
            if (typeof val === undefined || val === null) {
                val = '';
            }
            else if (shared.isPlainObject(val)) {
                val = JSON.stringify(val);
            }
            return encodeStr(key) + '=' + encodeStr(val);
        })
            .filter((x) => x.length > 0)
            .join('&')
        : null;
    return res ? `?${res}` : '';
}
/**
 * Decode text using `decodeURIComponent`. Returns the original text if it
 * fails.
 *
 * @param text - string to decode
 * @returns decoded string
 */
function decode(text) {
    try {
        return decodeURIComponent('' + text);
    }
    catch (err) { }
    return '' + text;
}
function decodedQuery(query = {}) {
    const decodedQuery = {};
    Object.keys(query).forEach((name) => {
        try {
            decodedQuery[name] = decode(query[name]);
        }
        catch (e) {
            decodedQuery[name] = query[name];
        }
    });
    return decodedQuery;
}
const PLUS_RE = /\+/g; // %2B
/**
 * https://github.com/vuejs/vue-router-next/blob/master/src/query.ts
 * @internal
 *
 * @param search - search string to parse
 * @returns a query object
 */
function parseQuery(search) {
    const query = {};
    // avoid creating an object with an empty key and empty value
    // because of split('&')
    if (search === '' || search === '?')
        return query;
    const hasLeadingIM = search[0] === '?';
    const searchParams = (hasLeadingIM ? search.slice(1) : search).split('&');
    for (let i = 0; i < searchParams.length; ++i) {
        // pre decode the + into space
        const searchParam = searchParams[i].replace(PLUS_RE, ' ');
        // allow the = character
        let eqPos = searchParam.indexOf('=');
        let key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
        let value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
        if (key in query) {
            // an extra variable for ts types
            let currentValue = query[key];
            if (!shared.isArray(currentValue)) {
                currentValue = query[key] = [currentValue];
            }
            currentValue.push(value);
        }
        else {
            query[key] = value;
        }
    }
    return query;
}

function debounce(fn, delay) {
    let timeout;
    const newFn = function () {
        clearTimeout(timeout);
        const timerFn = () => fn.apply(this, arguments);
        timeout = setTimeout(timerFn, delay);
    };
    newFn.cancel = function () {
        clearTimeout(timeout);
    };
    return newFn;
}

const NAVBAR_HEIGHT = 44;
const TABBAR_HEIGHT = 50;
const ON_REACH_BOTTOM_DISTANCE = 50;
const RESPONSIVE_MIN_WIDTH = 768;
const COMPONENT_NAME_PREFIX = 'VUni';
const PRIMARY_COLOR = '#007aff';
const UNI_SSR = '__uniSSR';
const UNI_SSR_TITLE = 'title';
const UNI_SSR_STORE = 'store';
const UNI_SSR_DATA = 'data';
const UNI_SSR_GLOBAL_DATA = 'globalData';
const SCHEME_RE = /^([a-z-]+:)?\/\//i;
const DATA_RE = /^data:.*,.*/;
const WEB_INVOKE_APPSERVICE = 'WEB_INVOKE_APPSERVICE';

function getEnvLocale() {
    const { env } = process;
    const lang = env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
    return (lang && lang.replace(/[.:].*/, '')) || 'en';
}

exports.BUILT_IN_TAGS = BUILT_IN_TAGS;
exports.COMPONENT_NAME_PREFIX = COMPONENT_NAME_PREFIX;
exports.COMPONENT_PREFIX = COMPONENT_PREFIX;
exports.COMPONENT_SELECTOR_PREFIX = COMPONENT_SELECTOR_PREFIX;
exports.DATA_RE = DATA_RE;
exports.NAVBAR_HEIGHT = NAVBAR_HEIGHT;
exports.NODE_TYPE_COMMENT = NODE_TYPE_COMMENT;
exports.NODE_TYPE_ELEMENT = NODE_TYPE_ELEMENT;
exports.NODE_TYPE_PAGE = NODE_TYPE_PAGE;
exports.NODE_TYPE_TEXT = NODE_TYPE_TEXT;
exports.ON_REACH_BOTTOM_DISTANCE = ON_REACH_BOTTOM_DISTANCE;
exports.PLUS_RE = PLUS_RE;
exports.PRIMARY_COLOR = PRIMARY_COLOR;
exports.RESPONSIVE_MIN_WIDTH = RESPONSIVE_MIN_WIDTH;
exports.SCHEME_RE = SCHEME_RE;
exports.TABBAR_HEIGHT = TABBAR_HEIGHT;
exports.TAGS = TAGS;
exports.UNI_SSR = UNI_SSR;
exports.UNI_SSR_DATA = UNI_SSR_DATA;
exports.UNI_SSR_GLOBAL_DATA = UNI_SSR_GLOBAL_DATA;
exports.UNI_SSR_STORE = UNI_SSR_STORE;
exports.UNI_SSR_TITLE = UNI_SSR_TITLE;
exports.UniBaseNode = UniBaseNode;
exports.UniCommentNode = UniCommentNode;
exports.UniElement = UniElement;
exports.UniEvent = UniEvent;
exports.UniInputElement = UniInputElement;
exports.UniNode = UniNode;
exports.UniTextAreaElement = UniTextAreaElement;
exports.UniTextNode = UniTextNode;
exports.WEB_INVOKE_APPSERVICE = WEB_INVOKE_APPSERVICE;
exports.addFont = addFont;
exports.cacheStringFunction = cacheStringFunction;
exports.callOptions = callOptions;
exports.createRpx2Unit = createRpx2Unit;
exports.debounce = debounce;
exports.decode = decode;
exports.decodeAttr = decodeAttr;
exports.decodeTag = decodeTag;
exports.decodedQuery = decodedQuery;
exports.defaultRpx2Unit = defaultRpx2Unit;
exports.encodeAttr = encodeAttr;
exports.encodeTag = encodeTag;
exports.formatDateTime = formatDateTime;
exports.getCustomDataset = getCustomDataset;
exports.getEnvLocale = getEnvLocale;
exports.getLen = getLen;
exports.initCustomDataset = initCustomDataset;
exports.invokeArrayFns = invokeArrayFns;
exports.isBuiltInComponent = isBuiltInComponent;
exports.isCustomElement = isCustomElement;
exports.isNativeTag = isNativeTag;
exports.normalizeDataset = normalizeDataset;
exports.normalizeTarget = normalizeTarget;
exports.once = once;
exports.parseQuery = parseQuery;
exports.passive = passive;
exports.plusReady = plusReady;
exports.removeLeadingSlash = removeLeadingSlash;
exports.sanitise = sanitise;
exports.scrollTo = scrollTo;
exports.stringifyQuery = stringifyQuery;
exports.updateElementStyle = updateElementStyle;
