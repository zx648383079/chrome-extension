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
        chrome.storage.local.get({ token: '' }).then(function (configs) {
            if (!configs.token) {
                alert('请先设置token');
                return;
            }
            var xhr = new XMLHttpRequest();
            xhr.open('post', url);
            xhr.setRequestHeader('content-type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Bearer ' + configs.token);
            xhr.send(JSON.stringify(data));
            xhr.onreadystatechange = function () {
                console.log(xhr.status);
            };
        });
    };
    ZreUtil.dialog = function (html) {
        var box = document.createElement('div');
        box.className = '_zre-dialog';
        box.innerHTML = html;
        document.body.appendChild(box);
        return box;
    };
    return ZreUtil;
}());
