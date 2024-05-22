/*
 * author: wendux
 * email: 824783146@qq.com
 * source code: https://github.com/wendux/Ajax-hook
 */

const events = ['load', 'loadend', 'timeout', 'error', 'readystatechange', 'abort'];

const OriginXhr = '__origin_xhr';

function configEvent(event: any, xhrProxy: any) {
    const e: any = {};
    for (var attr in event) {
        e[attr] = event[attr];
    }
    // xhrProxy instead
    e.target = e.currentTarget = xhrProxy
    return e;
}

function hook(proxy: any, win?: any) {
  win = win || window;
  let originXhr = win.XMLHttpRequest;
  let hooking = true;

    const HookXMLHttpRequest = function (this: any) {
        const xhr = new originXhr();
        for (let i = 0; i < events.length; ++i) {
            const key = 'on' + events[i];
            if (xhr[key] === undefined) {
                xhr[key] = null;
            }
        }

        for (const attr in xhr) {
            let type: string = '';
            try {
                type = typeof xhr[attr] // May cause exception on some browser
            } catch (e) {
            }
            if (type === 'function') {
                // hookAjax methods of xhr, such as `open`、`send` ...
                this[attr] = hookFunction(attr);
            } else if (attr !== OriginXhr) {
                Object.defineProperty(this, attr, {
                    get: getterFactory(attr),
                    set: setterFactory(attr),
                    enumerable: true
                }) 
            }
        }
        const that = this;
        xhr.getProxy = function () {
            return that
        }
        this[OriginXhr] = xhr;
    }

    HookXMLHttpRequest.prototype = originXhr.prototype;
    HookXMLHttpRequest.prototype.constructor = HookXMLHttpRequest;

    win.XMLHttpRequest = HookXMLHttpRequest;

    Object.assign(win.XMLHttpRequest, {UNSENT: 0, OPENED: 1, HEADERS_RECEIVED: 2, LOADING: 3, DONE: 4});

    // Generate getter for attributes of xhr
    function getterFactory(attr: string) {
        return function (this: any) {
            const originValue = this[OriginXhr][attr];
            if (hooking) {
                const v = this.hasOwnProperty(attr + '_') ? this[attr + '_'] : originValue;
                const attrGetterHook = (proxy[attr] || {})['getter'];
                return attrGetterHook && attrGetterHook(v, this) || v;
            } else {
                return originValue;
            }
        }
    }

    // Generate setter for attributes of xhr; by this we have an opportunity
    // to hookAjax event callbacks （eg: `onload`） of xhr;
    function setterFactory(attr: string) {
        return function (this: any, v: any) {
            const xhr = this[OriginXhr];
            if (hooking) {
                const that = this;
                const hook = proxy[attr];
                if (attr.substring(0, 2) === 'on') {
                    that[attr + '_'] = v;
                    xhr[attr] = function (e: any) {
                        e = configEvent(e, that)
                        const ret = proxy[attr] && proxy[attr].call(that, xhr, e)
                        ret || v.call(that, e);
                    }
                } else {
                    //If the attribute isn't writable, generate proxy attribute
                    const attrSetterHook = (hook || {})['setter'];
                    v = attrSetterHook && attrSetterHook(v, that) || v
                    this[attr + '_'] = v;
                    try {
                        // Not all attributes of xhr are writable(setter may undefined).
                        xhr[attr] = v;
                    } catch (e) {
                    }
                }
            } else {
                xhr[attr] = v;
            }
        }
    }

    // Hook methods of xhr.
    function hookFunction(fun: string) {
        return function (this: any) {
            const args = [].slice.call(arguments);
            if (proxy[fun] && hooking) {
                const ret = proxy[fun].call(this, args, this[OriginXhr])
                // If the proxy return value exists, return it directly,
                // otherwise call the function of xhr.
                if (ret) {
                    return ret;
                }
            }
            return this[OriginXhr][fun].apply(this[OriginXhr], args);
        }
    }

    function unHook() {
        hooking = false;
        if (win.XMLHttpRequest === HookXMLHttpRequest) {
            win.XMLHttpRequest = originXhr;
            HookXMLHttpRequest.prototype.constructor = originXhr;
            originXhr = undefined;
        }
    }
    return { originXhr, unHook  };
}