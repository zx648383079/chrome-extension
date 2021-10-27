"use strict";
chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
    if (request.cmd === 'start_goods') {
        new ShopProject().run();
        sendResponse('');
    }
    else if (request.cmd === 'start_exam') {
        new ExamProject().run();
        sendResponse('');
    }
    else if (request.cmd === 'collect') {
        new CollectProject().run();
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
var CollectProject = (function () {
    function CollectProject() {
    }
    CollectProject.prototype.run = function () {
        var _a;
        var url = window.location.href;
        var description = (_a = document.querySelector('[name="description"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content');
        var title = document.title;
        var icon = 'favicon.ico';
        ZreUtil.findAll('link').forEach(function (item) {
            var name = item.getAttribute('name');
            if (name && (name.indexOf('shortcut') >= 0 || name.indexOf('icon') >= 0)) {
                icon = item.getAttribute('content');
            }
        });
        if (icon.indexOf('//') < 0) {
            icon = url.substr(0, url.indexOf('/', 10) || url.length) + '/' + icon.replace(/^\//, '');
        }
        ZreUtil.post('http://zodream.localhost/cms/admin/content/import', { url: url, title: title, icon: icon, description: description });
    };
    return CollectProject;
}());
var ExamProject = (function () {
    function ExamProject() {
    }
    ExamProject.prototype.run = function () {
        var data = this.render();
        if (!data) {
            return;
        }
        ZreUtil.post('http://zodream.localhost/exam/admin/question/import', data);
        return;
    };
    ExamProject.prototype.render = function () {
        switch (window.location.host) {
            case 'www.jiakaobaodian.com':
                return this.renderJK();
            default:
                console.log('无相关程序');
                return;
        }
    };
    ExamProject.prototype.renderJK = function () {
        var box = ZreUtil.find('.layout-article');
        if (!box) {
            return;
        }
        var text = ZreUtil.find('.timu-text', box).innerText;
        var match = text.match(/(\d+)\/\d+、(.+)/);
        if (!match) {
            return;
        }
        var id = match[1];
        var title = match[2];
        var options = [];
        ZreUtil.findAll('.options-w p', box).forEach(function (item) {
            var right = item.classList.contains('success');
            var content = item.innerText.replace(/[A-Z]、/, '');
            options.push({ content: content, right: right });
        });
        var xjBox = ZreUtil.find('.xiangjie', box);
        if (!xjBox) {
            return { id: id, title: title, options: options };
        }
        var analysis = ZreUtil.find('.content', xjBox).innerText;
        var easiness = parseInt(ZreUtil.find('.bfb', xjBox).style.width.replace('%', '')) / 10;
        return { id: id, title: title, options: options, analysis: analysis, easiness: easiness };
    };
    return ExamProject;
}());
var ShopProject = (function () {
    function ShopProject() {
    }
    ShopProject.prototype.run = function () {
        var data = this.render();
        if (!data) {
            return;
        }
        ZreUtil.post('http://zodream.localhost/shop/admin/goods/import', data);
        return;
    };
    ShopProject.prototype.render = function () {
        switch (window.location.host) {
            case 'item.jd.com':
                return this.renderJD();
            case 'detail.tmall.com':
                return this.renderTM();
            case 'item.taobao.com':
                return this.renderTB();
            default:
                console.log('无相关程序');
                return;
        }
    };
    ShopProject.prototype.renderJD = function () {
        var _a, _b, _c, _d, _e, _f, _g;
        var id = window.location.pathname.replace('/', '').replace(/\..+$/, '');
        var title = (_a = ZreUtil.find('.sku-name')) === null || _a === void 0 ? void 0 : _a.innerText;
        var description = (_b = ZreUtil.find('.news')) === null || _b === void 0 ? void 0 : _b.innerText;
        var price = (_c = ZreUtil.find('.p-price .price')) === null || _c === void 0 ? void 0 : _c.innerText.split('-')[0];
        var content = (_d = ZreUtil.find('#J-detail-content')) === null || _d === void 0 ? void 0 : _d.innerHTML;
        var thumb = (_e = ZreUtil.find('#spec-img')) === null || _e === void 0 ? void 0 : _e.src;
        var images = [];
        ZreUtil.findAll('#spec-list li img').forEach(function (item) {
            images.push(item.src);
        });
        var attrs = [];
        ZreUtil.findAll('#choose-attrs .p-choose').forEach(function (item) {
            var _a;
            var name = (_a = ZreUtil.find('.dt', item)) === null || _a === void 0 ? void 0 : _a.innerText.trim();
            if (!name) {
                return;
            }
            var items = [];
            ZreUtil.findAll('.item a', item).forEach(function (span) {
                items.push(span.innerText);
            });
            attrs.push({ name: name, items: items });
        });
        var brand = (_f = ZreUtil.find('#parameter-brand a')) === null || _f === void 0 ? void 0 : _f.innerText;
        var properties = [];
        ZreUtil.findAll('#detail .parameter2 li').forEach(function (item) {
            var args = item.innerText.split('：');
            if (args.length > 1) {
                properties.push({ name: args[0], value: args[1] });
            }
        });
        var category = (_g = ZreUtil.find('#crumb-wrap .first')) === null || _g === void 0 ? void 0 : _g.innerText;
        return { id: id, title: title, description: description, price: price, thumb: thumb, images: images, attrs: attrs, brand: brand, category: category, properties: properties, content: content };
    };
    ShopProject.prototype.renderTB = function () {
        var _a, _b, _c, _d, _e, _f;
        var url = window.location.href;
        var id = url.replace(/^.+id\=/i, '').replace(/&.+$/, '');
        var box = document.getElementById('detail');
        if (!box) {
            return;
        }
        var title = (_a = ZreUtil.find('#J_Title h3', box)) === null || _a === void 0 ? void 0 : _a.innerText;
        var description = (_b = ZreUtil.find('.tb-subtitle', box)) === null || _b === void 0 ? void 0 : _b.innerText;
        var price = (_c = ZreUtil.find('#J_PromoPriceNum', box)) === null || _c === void 0 ? void 0 : _c.innerText.split('-')[0];
        var attrs = [];
        (_d = ZreUtil.findAll('#J_isku .tb-prop', box)) === null || _d === void 0 ? void 0 : _d.forEach(function (item) {
            var _a;
            var name = (_a = ZreUtil.find('.tb-property-type', item)) === null || _a === void 0 ? void 0 : _a.innerText;
            if (!name) {
                return;
            }
            var items = [];
            ZreUtil.findAll('li a', item).forEach(function (span) {
                items.push(span.innerText);
            });
            attrs.push({ name: name, items: items });
        });
        var content = (_e = ZreUtil.find('#description .content')) === null || _e === void 0 ? void 0 : _e.innerHTML;
        var images = [];
        ZreUtil.findAll('#J_UlThumb li img', box).forEach(function (img) {
            images.push(img.src);
        });
        var thumb = (_f = ZreUtil.find('#J_ImgBooth')) === null || _f === void 0 ? void 0 : _f.src;
        var properties = [];
        ZreUtil.findAll('#attributes li').forEach(function (item) {
            var args = item.innerText.replace('&nbsp;', '').split(':');
            if (args.length > 1) {
                properties.push({ name: args[0], value: args[1] });
            }
        });
        return { id: id, title: title, description: description, price: price, thumb: thumb, images: images, attrs: attrs, properties: properties, content: content };
    };
    ShopProject.prototype.renderTM = function () {
        var _a, _b, _c, _d, _e, _f, _g;
        var url = window.location.href;
        var id = url.replace(/^.+id\=/i, '').replace(/&.+$/, '');
        var box = document.getElementById('detail');
        if (!box) {
            return;
        }
        var title = (_a = ZreUtil.find('.tb-detail-hd h1', box)) === null || _a === void 0 ? void 0 : _a.innerText;
        var description = (_b = ZreUtil.find('.tb-detail-hd .newp', box)) === null || _b === void 0 ? void 0 : _b.innerText;
        var price = (_c = ZreUtil.find('.tm-price', box)) === null || _c === void 0 ? void 0 : _c.innerText.split('-')[0];
        var attrs = [];
        (_d = ZreUtil.findAll('.tb-sku .tm-sale-prop', box)) === null || _d === void 0 ? void 0 : _d.forEach(function (item) {
            var _a;
            var name = (_a = ZreUtil.find('.tb-metatit', item)) === null || _a === void 0 ? void 0 : _a.innerText;
            if (!name) {
                return;
            }
            var items = [];
            ZreUtil.findAll('li span', item).forEach(function (span) {
                items.push(span.innerText);
            });
            attrs.push({ name: name, items: items });
        });
        var content = (_e = ZreUtil.find('#description .content')) === null || _e === void 0 ? void 0 : _e.innerHTML;
        var images = [];
        ZreUtil.findAll('#J_UlThumb li img', box).forEach(function (img) {
            images.push(img.src);
        });
        var thumb = (_f = ZreUtil.find('#J_ImgBooth')) === null || _f === void 0 ? void 0 : _f.src;
        var brand = (_g = ZreUtil.find('#J_BrandAttr .J_EbrandLogo')) === null || _g === void 0 ? void 0 : _g.innerText;
        var properties = [];
        ZreUtil.findAll('#J_AttrUL li').forEach(function (item) {
            var args = item.innerText.replace('&nbsp;', '').split(':');
            if (args.length > 1) {
                properties.push({ name: args[0], value: args[1] });
            }
        });
        return { id: id, title: title, description: description, price: price, thumb: thumb, images: images, attrs: attrs, brand: brand, properties: properties, content: content };
    };
    return ShopProject;
}());
