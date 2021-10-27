"use strict";
var ZreUtil = (function () {
    function ZreUtil() {
    }
    ZreUtil.find = function (tag, parent) {
        if (parent === void 0) { parent = document; }
        return parent.querySelector(tag);
    };
    ZreUtil.findAll = function (tag, parent) {
        if (parent === void 0) { parent = document; }
        return parent.querySelectorAll(tag);
    };
    ZreUtil.post = function (url, data) {
        var xhr = new XMLHttpRequest();
        xhr.open('post', url);
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.send(JSON.stringify(data));
        xhr.onreadystatechange = function () {
            console.log(xhr.status);
        };
    };
    return ZreUtil;
}());
