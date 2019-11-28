"use strict";
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.cmd === 'start_spider') {
        startSpider();
    }
    else {
        sendResponse('我收到你的消息了：' + JSON.stringify(request));
    }
});
function sendMessage(cmd, data) {
    if (typeof cmd !== 'object') {
        cmd = { cmd: cmd, data: data };
    }
    chrome.runtime.sendMessage(cmd, function (response) {
        console.log('收到来自后台的回复：' + response);
    });
}
function createUrl(content) {
    var blob = new Blob([content]);
    return URL.createObjectURL(blob);
}
function startSpider() {
    console.log(getSpiderData());
    return;
    sendMessage({
        cmd: 'batch_download',
        files: [
            {
                url: createUrl('1231231'),
                filename: '1.json'
            }
        ],
        folder: 'test'
    });
}
function getSpiderData() {
    switch (window.location.host) {
        case 'item.jd.com':
            return getJD();
        case 'detail.tmall.com':
            return getTM();
        case 'item.taobao.com':
            return getTB();
        default:
            console.log('无相关程序');
            return;
    }
}
function getTB() {
    var _a, _b, _c, _d, _e, _f;
    var url = window.location.href;
    var id = url.replace(/^.+id\=/i, '').replace(/&.+$/, '');
    var box = document.getElementById('detail');
    if (!box) {
        return;
    }
    var title = (_a = Zo('#J_Title h3', box)) === null || _a === void 0 ? void 0 : _a.innerText;
    var description = (_b = Zo('.tb-subtitle', box)) === null || _b === void 0 ? void 0 : _b.innerText;
    var price = (_c = Zo('#J_PromoPriceNum', box)) === null || _c === void 0 ? void 0 : _c.innerText.split('-')[0];
    var spec = [];
    (_d = ZoR('#J_isku .tb-prop', box)) === null || _d === void 0 ? void 0 : _d.forEach(function (item) {
        var _a;
        var name = (_a = Zo('.tb-property-type', item)) === null || _a === void 0 ? void 0 : _a.innerText;
        if (!name) {
            return;
        }
        var attrs = [];
        ZoR('li a', item).forEach(function (span) {
            attrs.push(span.innerText);
        });
        spec.push({ name: name, attrs: attrs });
    });
    var content = (_e = Zo('#description .content')) === null || _e === void 0 ? void 0 : _e.innerHTML;
    var images = [];
    ZoR('#J_UlThumb li img', box).forEach(function (img) {
        images.push(img.src);
    });
    var thumb = (_f = Zo('#J_ImgBooth')) === null || _f === void 0 ? void 0 : _f.src;
    return { id: id, title: title, description: description, price: price, thumb: thumb, images: images, spec: spec, content: content };
}
function getTM() {
    var _a, _b, _c, _d, _e, _f;
    var url = window.location.href;
    var id = url.replace(/^.+id\=/i, '').replace(/&.+$/, '');
    var box = document.getElementById('detail');
    if (!box) {
        return;
    }
    var title = (_a = Zo('.tb-detail-hd h1', box)) === null || _a === void 0 ? void 0 : _a.innerText;
    var description = (_b = Zo('.tb-detail-hd .newp', box)) === null || _b === void 0 ? void 0 : _b.innerText;
    var price = (_c = Zo('.tm-price', box)) === null || _c === void 0 ? void 0 : _c.innerText.split('-')[0];
    var spec = [];
    (_d = ZoR('.tb-sku .tm-sale-prop', box)) === null || _d === void 0 ? void 0 : _d.forEach(function (item) {
        var _a;
        var name = (_a = Zo('.tb-metatit', item)) === null || _a === void 0 ? void 0 : _a.innerText;
        if (!name) {
            return;
        }
        var attrs = [];
        ZoR('li span', item).forEach(function (span) {
            attrs.push(span.innerText);
        });
        spec.push({ name: name, attrs: attrs });
    });
    var content = (_e = Zo('#description .content')) === null || _e === void 0 ? void 0 : _e.innerHTML;
    var images = [];
    ZoR('#J_UlThumb li img', box).forEach(function (img) {
        images.push(img.src);
    });
    var thumb = (_f = Zo('#J_ImgBooth')) === null || _f === void 0 ? void 0 : _f.src;
    return { id: id, title: title, description: description, price: price, thumb: thumb, images: images, spec: spec, content: content };
}
function getJD() {
    var _a, _b, _c, _d, _e;
    var id = window.location.pathname.replace('/', '').replace(/\..+$/, '');
    var title = (_a = Zo('.sku-name')) === null || _a === void 0 ? void 0 : _a.innerText;
    var description = (_b = Zo('.news')) === null || _b === void 0 ? void 0 : _b.innerText;
    var price = (_c = Zo('.p-price .price')) === null || _c === void 0 ? void 0 : _c.innerText.split('-')[0];
    var content = (_d = Zo('#J-detail-content')) === null || _d === void 0 ? void 0 : _d.innerHTML;
    var thumb = (_e = Zo('#spec-img')) === null || _e === void 0 ? void 0 : _e.src;
    var images = [];
    ZoR('#spec-list li img').forEach(function (item) {
        images.push(item.src);
    });
    var spec = [];
    ZoR('#choose-attrs .p-choose').forEach(function (item) {
        var _a;
        var name = (_a = Zo('.dt', item)) === null || _a === void 0 ? void 0 : _a.innerText.trim();
        if (!name) {
            return;
        }
        var attrs = [];
        ZoR('.item a', item).forEach(function (span) {
            attrs.push(span.innerText);
        });
        spec.push({ name: name, attrs: attrs });
    });
    return { id: id, title: title, description: description, price: price, thumb: thumb, images: images, spec: spec, content: content };
}
function Zo(tag, parent) {
    if (parent === void 0) { parent = document; }
    return parent.querySelector(tag);
}
function ZoR(tag, parent) {
    if (parent === void 0) { parent = document; }
    return parent.querySelectorAll(tag);
}
