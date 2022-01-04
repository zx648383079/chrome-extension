"use strict";
(function () {
    var form = document.querySelector('._zre-form');
    if (!form) {
        return;
    }
    var saveToken = function (token) {
        if (!token || token.trim().length < 1) {
            chrome.storage.local.remove('token', function () { });
            return;
        }
        chrome.storage.local.set({ token: token }, function () {
            alert('保存成功');
        });
    };
    form.addEventListener('submit', function () {
        saveToken(form.elements['token'].value);
        return false;
    });
})();
