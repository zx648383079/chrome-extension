"use strict";
;
(function () {
    var _a, _b, _c;
    var zreBg = chrome.extension.getBackgroundPage();
    (_a = document.getElementById('start-goods')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
        zreBg.startGoods();
    });
    (_b = document.getElementById('start-exam')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
        zreBg.startExam();
    });
    (_c = document.getElementById('collect')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function () {
        zreBg.collect();
    });
})();
