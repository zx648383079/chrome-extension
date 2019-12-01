"use strict";
var _a, _b, _c;
var bg = chrome.extension.getBackgroundPage();
(_a = document.getElementById('start-goods')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
    bg.startGoods();
});
(_b = document.getElementById('start-exam')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
    bg.startExam();
});
(_c = document.getElementById('collect')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function () {
    bg.collect();
});
