"use strict";
chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
    if (request.cmd === 'start_goods') {
        startGoods();
        sendResponse('');
    }
    else if (request.cmd === 'start_exam') {
        startExam();
        sendResponse('');
    }
    else if (request.cmd === 'collect') {
        collect();
        sendResponse('');
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
function collect() {
    var _a;
    var url = window.location.href;
    var description = (_a = document.querySelector('[name="description"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content');
    var title = document.title;
    var icon = 'favicon.ico';
    ZoR('link').forEach(function (item) {
        var name = item.getAttribute('name');
        if (name && (name.indexOf('shortcut') >= 0 || name.indexOf('icon') >= 0)) {
            icon = item.getAttribute('content');
        }
    });
    if (icon.indexOf('//') < 0) {
        icon = url.substr(0, url.indexOf('/', 10) || url.length) + '/' + icon.replace(/^\//, '');
    }
    ajax('http://zodream.localhost/cms/admin/content/import', { url: url, title: title, icon: icon, description: description });
}
function startExam() {
    var data = getSpiderData();
    if (!data) {
        return;
    }
    ajax('http://zodream.localhost/exam/admin/question/import', data);
    return;
    sendMessage({
        cmd: 'batch_download',
        files: [
            {
                content: data,
                filename: data.id + '.json'
            }
        ],
        folder: 'exam_question'
    });
}
function startGoods() {
    var data = getSpiderData();
    if (!data) {
        return;
    }
    ajax('http://zodream.localhost/shop/admin/goods/import', data);
    return;
    sendMessage({
        cmd: 'batch_download',
        files: [
            {
                content: data,
                filename: data.id + '.json'
            }
        ],
        folder: 'shop_goods'
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
        case 'www.jiakaobaodian.com':
            return getJK();
        default:
            console.log('无相关程序');
            return;
    }
}
function getJK() {
    var box = Zo('.layout-article');
    if (!box) {
        return;
    }
    var text = Zo('.timu-text', box).innerText;
    var match = text.match(/(\d+)\/\d+、(.+)/);
    if (!match) {
        return;
    }
    var id = match[1];
    var title = match[2];
    var options = [];
    ZoR('.options-w p', box).forEach(function (item) {
        var right = item.classList.contains('success');
        var content = item.innerText.replace(/[A-Z]、/, '');
        options.push({ content: content, right: right });
    });
    var xjBox = Zo('.xiangjie', box);
    if (!xjBox) {
        return { id: id, title: title, options: options };
    }
    var analysis = Zo('.content', xjBox).innerText;
    var easiness = parseInt(Zo('.bfb', xjBox).style.width.replace('%', '')) / 10;
    return { id: id, title: title, options: options, analysis: analysis, easiness: easiness };
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
    var attrs = [];
    (_d = ZoR('#J_isku .tb-prop', box)) === null || _d === void 0 ? void 0 : _d.forEach(function (item) {
        var _a;
        var name = (_a = Zo('.tb-property-type', item)) === null || _a === void 0 ? void 0 : _a.innerText;
        if (!name) {
            return;
        }
        var items = [];
        ZoR('li a', item).forEach(function (span) {
            items.push(span.innerText);
        });
        attrs.push({ name: name, items: items });
    });
    var content = (_e = Zo('#description .content')) === null || _e === void 0 ? void 0 : _e.innerHTML;
    var images = [];
    ZoR('#J_UlThumb li img', box).forEach(function (img) {
        images.push(img.src);
    });
    var thumb = (_f = Zo('#J_ImgBooth')) === null || _f === void 0 ? void 0 : _f.src;
    var properties = [];
    ZoR('#attributes li').forEach(function (item) {
        var args = item.innerText.replace('&nbsp;', '').split(':');
        if (args.length > 1) {
            properties.push({ name: args[0], value: args[1] });
        }
    });
    return { id: id, title: title, description: description, price: price, thumb: thumb, images: images, attrs: attrs, properties: properties, content: content };
}
function getTM() {
    var _a, _b, _c, _d, _e, _f, _g;
    var url = window.location.href;
    var id = url.replace(/^.+id\=/i, '').replace(/&.+$/, '');
    var box = document.getElementById('detail');
    if (!box) {
        return;
    }
    var title = (_a = Zo('.tb-detail-hd h1', box)) === null || _a === void 0 ? void 0 : _a.innerText;
    var description = (_b = Zo('.tb-detail-hd .newp', box)) === null || _b === void 0 ? void 0 : _b.innerText;
    var price = (_c = Zo('.tm-price', box)) === null || _c === void 0 ? void 0 : _c.innerText.split('-')[0];
    var attrs = [];
    (_d = ZoR('.tb-sku .tm-sale-prop', box)) === null || _d === void 0 ? void 0 : _d.forEach(function (item) {
        var _a;
        var name = (_a = Zo('.tb-metatit', item)) === null || _a === void 0 ? void 0 : _a.innerText;
        if (!name) {
            return;
        }
        var items = [];
        ZoR('li span', item).forEach(function (span) {
            items.push(span.innerText);
        });
        attrs.push({ name: name, items: items });
    });
    var content = (_e = Zo('#description .content')) === null || _e === void 0 ? void 0 : _e.innerHTML;
    var images = [];
    ZoR('#J_UlThumb li img', box).forEach(function (img) {
        images.push(img.src);
    });
    var thumb = (_f = Zo('#J_ImgBooth')) === null || _f === void 0 ? void 0 : _f.src;
    var brand = (_g = Zo('#J_BrandAttr .J_EbrandLogo')) === null || _g === void 0 ? void 0 : _g.innerText;
    var properties = [];
    ZoR('#J_AttrUL li').forEach(function (item) {
        var args = item.innerText.replace('&nbsp;', '').split(':');
        if (args.length > 1) {
            properties.push({ name: args[0], value: args[1] });
        }
    });
    return { id: id, title: title, description: description, price: price, thumb: thumb, images: images, attrs: attrs, brand: brand, properties: properties, content: content };
}
function getJD() {
    var _a, _b, _c, _d, _e, _f, _g;
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
    var attrs = [];
    ZoR('#choose-attrs .p-choose').forEach(function (item) {
        var _a;
        var name = (_a = Zo('.dt', item)) === null || _a === void 0 ? void 0 : _a.innerText.trim();
        if (!name) {
            return;
        }
        var items = [];
        ZoR('.item a', item).forEach(function (span) {
            items.push(span.innerText);
        });
        attrs.push({ name: name, items: items });
    });
    var brand = (_f = Zo('#parameter-brand a')) === null || _f === void 0 ? void 0 : _f.innerText;
    var properties = [];
    ZoR('#detail .parameter2 li').forEach(function (item) {
        var args = item.innerText.split('：');
        if (args.length > 1) {
            properties.push({ name: args[0], value: args[1] });
        }
    });
    var category = (_g = Zo('#crumb-wrap .first')) === null || _g === void 0 ? void 0 : _g.innerText;
    return { id: id, title: title, description: description, price: price, thumb: thumb, images: images, attrs: attrs, brand: brand, category: category, properties: properties, content: content };
}
function Zo(tag, parent) {
    if (parent === void 0) { parent = document; }
    return parent.querySelector(tag);
}
function ZoR(tag, parent) {
    if (parent === void 0) { parent = document; }
    return parent.querySelectorAll(tag);
}
function ajax(url, data) {
    var xhr = new XMLHttpRequest();
    xhr.open('post', url);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(JSON.stringify(data));
    xhr.onreadystatechange = function () {
        console.log(xhr.status);
    };
}
