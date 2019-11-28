"use strict";
var _a;
function getCurrentTabId(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        callback && callback(tabs.length ? tabs[0].id : null);
    });
}
function sendMessageToContentScript(message, callback) {
    getCurrentTabId(function (tabId) {
        chrome.tabs.sendMessage(tabId, message, function (response) {
            callback && callback(response);
        });
    });
}
var bg = chrome.extension.getBackgroundPage();
(_a = document.getElementById('start-spider')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
    bg.startSpider();
});
