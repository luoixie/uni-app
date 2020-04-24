/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
function e(){for(var e=0,n=0,t=arguments.length;n<t;n++)e+=arguments[n].length;var r=Array(e),o=0;for(n=0;n<t;n++)for(var u=arguments[n],i=0,a=u.length;i<a;i++,o++)r[o]=u[i];return r}var n="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!=typeof msCrypto&&"function"==typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto),t=new Uint8Array(16);function r(){if(!n)throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return n(t)}for(var o=[],u=0;u<256;++u)o[u]=(u+256).toString(16).substr(1);function i(e,n,t){var u=n&&t||0;"string"==typeof e&&(n="binary"===e?new Array(16):null,e=null);var i=(e=e||{}).random||(e.rng||r)();if(i[6]=15&i[6]|64,i[8]=63&i[8]|128,n)for(var a=0;a<16;++a)n[u+a]=i[a];return n||function(e,n){var t=n||0,r=o;return[r[e[t++]],r[e[t++]],r[e[t++]],r[e[t++]],"-",r[e[t++]],r[e[t++]],"-",r[e[t++]],r[e[t++]],"-",r[e[t++]],r[e[t++]],"-",r[e[t++]],r[e[t++]],r[e[t++]],r[e[t++]],r[e[t++]],r[e[t++]]].join("")}(i)}var a=Object.prototype.hasOwnProperty,c=Array.isArray,s=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;function f(e,n){if(c(e))return e;if(n&&(t=n,r=e,a.call(t,r)))return[e];var t,r,o=[];return e.replace(s,(function(e,n,t,r){return o.push(t?r.replace(/\\(\\)?/g,"$1"):n||e),r})),o}function l(e,n){var t,r=f(n,e);for(t=r.shift();null!=t;){if(null==(e=e[t]))return;t=r.shift()}return e}var d=new Map;function g(e){var n=d.get(e);if(!n)throw Error("element destroyed");return n.element}function m(e){if(!function(e){if(e){var n=e.tagName;return 0===n.indexOf("UNI-")||"BODY"===n}return!1}(e))throw Error("no such element");var n,t,r={elementId:(n=e,t=n._id,t||(t=i(),n._id=t,d.set(t,{id:t,element:n})),t),tagName:e.tagName.toLocaleLowerCase().replace("uni-","")},o=e.__vue__;return o&&!o.$options.isReserved&&(r.nodeId=o._uid),"video"===r.tagName&&(r.videoId=r.nodeId),r}function p(e,n){return Promise.resolve(m(e.querySelector(n)))}function v(e,n){var t=[];return document.querySelectorAll(n).forEach((function(e){try{t.push(m(e))}catch(e){}})),Promise.resolve({elements:t})}function _(e,n){return Promise.resolve({properties:n.map((function(n){return l(e,n)}))})}function h(e,n,t){t||(t={}),t.touches||(t.touches=[]),t.changedTouches||(t.changedTouches=[]),t.touches.length||t.touches.push({identifier:Date.now(),target:e});var r=t.touches.map((function(e){return new Touch(e)})),o=t.changedTouches.map((function(e){return new Touch(e)}));return e.dispatchEvent(new TouchEvent(n,{cancelable:!0,bubbles:!0,touches:r,targetTouches:[],changedTouches:o})),Promise.resolve()}var y={input:{input:function(e,n){var t=e.__vue__;t.inputValue=n,t._onInput({target:{value:n}})}},textarea:{input:function(e,n){e.__vue__.valueSync=n}},"scroll-view":{scrollTo:function(e,n,t){var r=e.__vue__.$refs.main;r.scrollLeft=n,r.scrollTop=t},scrollTop:function(e){return e.__vue__.$refs.main.scrollTop},scrollLeft:function(e){return e.__vue__.$refs.main.scrollLeft},scrollWidth:function(e){return e.__vue__.$refs.main.scrollWidth},scrollHeight:function(e){return e.__vue__.$refs.main.scrollHeight}},swiper:{swipeTo:function(e,n){e.__vue__.current=n}},"movable-view":{moveTo:function(e,n,t){e.__vue__._animationTo(n,t)}},switch:{tap:function(e){e.click()}},slider:{slideTo:function(e,n){var t=e.__vue__,r=t.$refs["uni-slider"],o=r.offsetWidth,u=r.getBoundingClientRect().left;t.value=n,t._onClick({x:(n-t.min)*o/(t.max-t.min)+u})}}};var T,I={getElement:function(e){return p(document,e.selector)},getElements:function(e){return v(document,e.selector)},getWindowProperties:function(e){return _(window,e.names)}},E={getElement:function(e){return p(g(e.elementId),e.selector)},getElements:function(e){return v(g(e.elementId),e.selector)},getDOMProperties:function(e){return _(g(e.elementId),e.names)},getProperties:function(e){return _(g(e.elementId).__vue__,e.names)},getOffset:function(e){var n=g(e.elementId).getBoundingClientRect();return Promise.resolve({left:n.left+window.pageXOffset,top:n.top+window.pageYOffset})},getAttributes:function(e){return n=g(e.elementId),t=e.names,Promise.resolve({attributes:t.map((function(e){return String(n.getAttribute(e))}))});var n,t},getStyles:function(e){return n=g(e.elementId),t=e.names,r=getComputedStyle(n),Promise.resolve({styles:t.map((function(e){return r[e]}))});var n,t,r},getHTML:function(e){return n=g(e.elementId),t=e.type,Promise.resolve({html:(r="outer"===t?n.outerHTML:n.innerHTML,r.replace(/\n/g,"").replace(/(<uni-text[^>]*>)(<span[^>]*>[^<]*<\/span>)(.*?<\/uni-text>)/g,"$1$3").replace(/<\/?[^>]*>/g,(function(e){return-1<e.indexOf("<body")?"<page>":"</body>"===e?"</page>":0!==e.indexOf("<uni-")&&0!==e.indexOf("</uni-")?"":e.replace(/uni-/g,"").replace(/ role=""/g,"").replace(/ aria-label=""/g,"")})))});var n,t,r},tap:function(e){return g(e.elementId).click(),Promise.resolve()},touchstart:function(e){return h(g(e.elementId),"touchstart",e)},touchmove:function(e){return h(g(e.elementId),"touchmove",e)},touchend:function(e){return h(g(e.elementId),"touchend",e)},callFunction:function(n){return t=g(n.elementId),r=n.functionName,o=n.args,(u=l(y,r))?Promise.resolve({result:u.apply(null,e([t],o))}):Promise.reject(Error(r+" not exists"));var t,r,o,u},triggerEvent:function(e){return n=g(e.elementId),t=e.type,r=e.detail,(o=n.__vue__).$trigger&&o.$trigger(t,{},r),Promise.resolve();var n,t,r,o}},S={};function O(e){return UniViewJSBridge.publishHandler("onAutoMessageReceive",e)}function w(e){return e.__wxWebviewId__?e.__wxWebviewId__:e.privateProperties?e.privateProperties.slaveId:e.$page?e.$page.id:void 0}function P(e){return e.route||e.uri}function b(e){return e.options||e.$page&&e.$page.options||{}}function M(e){return{id:w(e),path:P(e),query:b(e)}}function $(e){var n=function(e){return getCurrentPages().find((function(n){return w(n)===e}))}(e);return n&&n.$vm}function N(e,n){var t=$(e);return t&&function e(n,t){var r,o;return n&&(n._uid&&n._uid===t||n.$scope&&((o=n.$scope).__wxExparserNodeId__||o.nodeId||o.id)===t?r=n:n.$children.find((function(n){return r=e(n,t)}))),r}(t,n)}function x(e,n){var t;return e&&(t=n?l(e.$data,n):Object.assign({},e.$data)),Promise.resolve({data:t})}function C(e,n){return e&&Object.keys(n).forEach((function(t){e[t]=n[t]})),Promise.resolve()}function A(e,n,t){return new Promise((function(r,o){if(!e)return o(T.VM_NOT_EXISTS);if(!e[n])return o(T.VM_NOT_EXISTS);var u,i=e[n].apply(e,t);!(u=i)||"object"!=typeof u&&"function"!=typeof u||"function"!=typeof u.then?r({result:i}):i.then((function(e){r({result:e})}))}))}Object.keys(I).forEach((function(e){S["Page."+e]=I[e]})),Object.keys(E).forEach((function(e){S["Element."+e]=E[e]})),UniViewJSBridge.subscribe("sendAutoMessage",(function(e){var n=e.id,t=e.method,r=e.params,o={id:n},u=S[t];if(!u)return o.error={message:t+" unimplemented"},O(o);try{u(r).then((function(e){e&&(o.result=e)})).catch((function(e){o.error={message:e.message}})).finally((function(){O(o)}))}catch(e){o.error={message:e.message},O(o)}})),function(e){e.VM_NOT_EXISTS="VM_NOT_EXISTS",e.METHOD_NOT_EXISTS="METHOD_NOT_EXISTS"}(T||(T={}));var V=/Sync$/;var j={getPageStack:function(){return Promise.resolve({pageStack:getCurrentPages().map((function(e){return M(e)}))})},getCurrentPage:function(){var e=getCurrentPages(),n=e.length;return new Promise((function(t,r){n?t(M(e[n-1])):r(Error("getCurrentPages().length=0"))}))},callUniMethod:function(e){var n=e.method,t=e.args;return new Promise((function(e,r){if(!uni[n])return r(Error("uni."+n+" not exists"));if(function(e){return V.test(e)}(n))return e({result:uni[n].apply(uni,t)});var o=[Object.assign({},t[0]||{},{success:function(t){setTimeout((function(){e({result:t})}),"pageScrollTo"===n?350:0)},fail:function(e){r(Error(e.errMsg.replace(n+":fail ","")))}})];uni[n].apply(uni,o)}))}},k={getData:function(e){return x($(e.pageId),e.path)},setData:function(e){return C($(e.pageId),e.data)},callMethod:function(e){var n,t=((n={})[T.VM_NOT_EXISTS]="Page["+e.pageId+"] not exists",n[T.METHOD_NOT_EXISTS]="page."+e.method+" not exists",n);return new Promise((function(n,r){A($(e.pageId),e.method,e.args).then((function(e){return n(e)})).catch((function(e){r(Error(t[e]))}))}))}};function D(e){return e.nodeId||e.elementId}var R={getData:function(e){return x(N(e.pageId,D(e)),e.path)},setData:function(e){return C(N(e.pageId,D(e)),e.data)},callMethod:function(e){var n,t=D(e),r=((n={})[T.VM_NOT_EXISTS]="Component["+e.pageId+":"+t+"] not exists",n[T.METHOD_NOT_EXISTS]="component."+e.method+" not exists",n);return new Promise((function(n,o){A(N(e.pageId,t),e.method,e.args).then((function(e){return n(e)})).catch((function(e){o(Error(r[e]))}))}))}},H={};Object.keys(j).forEach((function(e){H["App."+e]=j[e]})),Object.keys(k).forEach((function(e){H["Page."+e]=k[e]})),Object.keys(R).forEach((function(e){H["Element."+e]=R[e]}));var X=process.env.UNI_AUTOMATOR_WS_ENDPOINT;setTimeout((function(){!function(e){void 0===e&&(e={}),UniServiceJSBridge.subscribe("onAutoMessageReceive",(function(e){t(e)}));var n=uni.connectSocket({url:X,complete:function(){}}),t=function(e){return n.send({data:JSON.stringify(e)})};n.onOpen((function(n){e.success&&e.success(),console.log("已开启自动化测试...")})),n.onMessage((function(e){var n=JSON.parse(e.data),r=n.id,o=n.method,u=n.params,i={id:r},a=H[o];if(!a)return UniServiceJSBridge.publishHandler("sendAutoMessage",{id:r,method:o,params:u});try{a(u).then((function(e){e&&(i.result=e)})).catch((function(e){i.error={message:e.message}})).finally((function(){t(i)}))}catch(e){i.error={message:e.message},t(i)}})),n.onError((function(e){console.log("automator.onError",e)})),n.onClose((function(){e.fail&&e.fail({errMsg:"$$initRuntimeAutomator:fail"}),console.log("automator.onClose")}))}()}),500);
