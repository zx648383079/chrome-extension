chrome.runtime.onMessage.addListener(function(request, _, sendResponse)
{
	if (request.cmd === 'start_goods') {
        startGoods();
        sendResponse('');
    } else if (request.cmd === 'start_exam') {
        startExam();
        sendResponse('');
    } else if (request.cmd === 'collect') {
        collect();
        sendResponse('');
    } else {
		sendResponse('我收到你的消息了：'+JSON.stringify(request));
	}
});

function sendMessage(cmd: string| any, data?: any) {
    if (typeof cmd !== 'object') {
        cmd = {cmd, data}
    }
    chrome.runtime.sendMessage(cmd, function(response: any) {
        console.log('收到来自后台的回复：' + response);
    });
}

function collect() {
    const url = window.location.href;
    const description = document.querySelector('[name="description"]')?.getAttribute('content');
    const title = document.title;
    let icon = 'favicon.ico';
    ZoR<HTMLLinkElement>('link').forEach(item => {
        const name = item.getAttribute('name');
        if (name && (name.indexOf('shortcut') >= 0 || name.indexOf('icon') >= 0)) {
            icon = item.getAttribute('content') as string;
        }
    });
    if (icon.indexOf('//') < 0) {
        icon = url.substr(0, url.indexOf('/', 10) || url.length) + '/' + icon.replace(/^\//, '');
    }
    ajax('http://zodream.localhost/cms/admin/content/import', {url, title, icon, description});
}

function startExam() {
    let data = getSpiderData();
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
                filename: data.id + '.json',
            }
        ],
        folder: 'exam_question'
    });
}

function startGoods() {
    let data = getSpiderData();
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
                filename: data.id + '.json',
            }
        ],
        folder: 'shop_goods'
    });
}

function getSpiderData() {
    switch(window.location.host) {
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
    const box = Zo<HTMLDivElement>('.layout-article');
    if (!box) {
        return;
    }
    const text = Zo<HTMLDivElement>('.timu-text', box).innerText;
    const match = text.match(/(\d+)\/\d+、(.+)/);
    if (!match) {
        return;
    }
    const id = match[1];
    const title = match[2];
    const options: any[] = [];
    ZoR<HTMLDivElement>('.options-w p', box).forEach(item => {
        const right = item.classList.contains('success');
        const content = item.innerText.replace(/[A-Z]、/, '');
        options.push({content, right});
    });
    const xjBox = Zo<HTMLDivElement>('.xiangjie', box);
    if (!xjBox) {
        return {id, title, options};
    }
    const analysis = Zo<HTMLDivElement>('.content', xjBox).innerText;
    const easiness = parseInt(Zo<HTMLDivElement>('.bfb', xjBox).style.width.replace('%', '')) / 10;
    return {id, title, options, analysis, easiness};
}

function getTB() {
    const url = window.location.href;
    const id = url.replace(/^.+id\=/i, '').replace(/&.+$/, '');
    const box = document.getElementById('detail') as HTMLDivElement;
    if (!box) {
        return;
    }
    const title = Zo<HTMLDivElement>('#J_Title h3', box)?.innerText;
    const description = Zo<HTMLDivElement>('.tb-subtitle', box)?.innerText;
    const price = Zo<HTMLDivElement>('#J_PromoPriceNum', box)?.innerText.split('-')[0];
    let attrs: any[] = [];
    ZoR<HTMLDivElement>('#J_isku .tb-prop', box)?.forEach(item => {
        const name = Zo<HTMLDivElement>('.tb-property-type', item)?.innerText;
        if (!name) {
            return;
        }
        let items: string[] = [];
        ZoR<HTMLSpanElement>('li a', item).forEach(span => {
            items.push(span.innerText);
        });
        attrs.push({name, items});
    });
    const content = Zo<HTMLDivElement>('#description .content')?.innerHTML;
    let images: string[] = [];
    ZoR<HTMLImageElement>('#J_UlThumb li img', box).forEach(img => {
        images.push(img.src);
    });
    const thumb = Zo<HTMLImageElement>('#J_ImgBooth')?.src;
    let properties: any[] = [];
    ZoR<HTMLLIElement>('#attributes li').forEach(item => {
        const args = item.innerText.replace('&nbsp;', '').split(':');
        if (args.length > 1) {
            properties.push({name: args[0], value: args[1]});
        }
    });
    return {id, title, description, price, thumb, images, attrs, properties, content};
}

function getTM() {
    const url = window.location.href;
    const id = url.replace(/^.+id\=/i, '').replace(/&.+$/, '');
    const box = document.getElementById('detail') as HTMLDivElement;
    if (!box) {
        return;
    }
    const title = Zo<HTMLDivElement>('.tb-detail-hd h1', box)?.innerText;
    const description = Zo<HTMLDivElement>('.tb-detail-hd .newp', box)?.innerText;
    const price = Zo<HTMLDivElement>('.tm-price', box)?.innerText.split('-')[0];
    let attrs: any[] = [];
    ZoR<HTMLDivElement>('.tb-sku .tm-sale-prop', box)?.forEach(item => {
        const name = Zo<HTMLDivElement>('.tb-metatit', item)?.innerText;
        if (!name) {
            return;
        }
        let items: string[] = [];
        ZoR<HTMLSpanElement>('li span', item).forEach(span => {
            items.push(span.innerText);
        });
        attrs.push({name, items});
    });
    const content = Zo<HTMLDivElement>('#description .content')?.innerHTML;
    let images: string[] = [];
    ZoR<HTMLImageElement>('#J_UlThumb li img', box).forEach(img => {
        images.push(img.src);
    });
    const thumb = Zo<HTMLImageElement>('#J_ImgBooth')?.src;
    const brand = Zo<HTMLDivElement>('#J_BrandAttr .J_EbrandLogo')?.innerText;
    let properties: any[] = [];
    ZoR<HTMLLIElement>('#J_AttrUL li').forEach(item => {
        const args = item.innerText.replace('&nbsp;', '').split(':');
        if (args.length > 1) {
            properties.push({name: args[0], value: args[1]});
        }
    });
    return {id, title, description, price, thumb, images, attrs, brand, properties, content};
}

function getJD() {
    const id = window.location.pathname.replace('/', '').replace(/\..+$/, '');
    const title = Zo<HTMLDivElement>('.sku-name')?.innerText;
    const description = Zo<HTMLDivElement>('.news')?.innerText;
    const price = Zo<HTMLDivElement>('.p-price .price')?.innerText.split('-')[0];
    const content = Zo<HTMLDivElement>('#J-detail-content')?.innerHTML;
    const thumb = Zo<HTMLImageElement>('#spec-img')?.src;
    let images: string[] = [];
    ZoR<HTMLImageElement>('#spec-list li img').forEach(item => {
        images.push(item.src);
    });
    let attrs: any[] = [];
    ZoR<HTMLDivElement>('#choose-attrs .p-choose').forEach(item => {
        const name = Zo<HTMLDivElement>('.dt', item)?.innerText.trim();
        if (!name) {
            return;
        }
        let items: string[] = [];
        ZoR<HTMLDivElement>('.item a', item).forEach(span => {
            items.push(span.innerText);
        });
        attrs.push({name, items});
    });
    const brand = Zo<HTMLDivElement>('#parameter-brand a')?.innerText;
    let properties: any[] = [];
    ZoR<HTMLLIElement>('#detail .parameter2 li').forEach(item => {
        const args = item.innerText.split('：');
        if (args.length > 1) {
            properties.push({name: args[0], value: args[1]});
        }
    });
    const category = Zo<HTMLLinkElement>('#crumb-wrap .first')?.innerText;
    return {id, title, description, price, thumb, images, attrs, brand, category, properties, content};
}

function Zo<T>(tag: string, parent: Document|HTMLElement = document): T {
    return parent.querySelector(tag) as any;
}

function ZoR<T>(tag: string, parent: Document|HTMLElement = document): T[] {
    return parent.querySelectorAll(tag) as any;
}

function ajax(url: string, data: any) {
    const xhr = new XMLHttpRequest();
    xhr.open('post', url);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(JSON.stringify(data));
    xhr.onreadystatechange = function() {
        console.log(xhr.status);
    };
}