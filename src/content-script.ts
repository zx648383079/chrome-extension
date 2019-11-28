chrome.runtime.onMessage.addListener(function(request: any, sender: any, sendResponse: (data: any) => void)
{
	if (request.cmd === 'start_spider') {
        startSpider();
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

function createUrl(content: string): string {
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
                filename: '1.json',
            }
        ],
        folder: 'test'
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
        default:
            console.log('无相关程序');
            
            return;
    }
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
    let spec: any[] = [];
    ZoR<HTMLDivElement>('#J_isku .tb-prop', box)?.forEach(item => {
        const name = Zo<HTMLDivElement>('.tb-property-type', item)?.innerText;
        if (!name) {
            return;
        }
        let attrs: string[] = [];
        ZoR<HTMLSpanElement>('li a', item).forEach(span => {
            attrs.push(span.innerText);
        });
        spec.push({name, attrs});
    });
    const content = Zo<HTMLDivElement>('#description .content')?.innerHTML;
    let images: string[] = [];
    ZoR<HTMLImageElement>('#J_UlThumb li img', box).forEach(img => {
        images.push(img.src);
    });
    const thumb = Zo<HTMLImageElement>('#J_ImgBooth')?.src;
    return {id, title, description, price, thumb, images, spec, content};
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
    let spec = [];
    ZoR<HTMLDivElement>('.tb-sku .tm-sale-prop', box)?.forEach(item => {
        const name = Zo<HTMLDivElement>('.tb-metatit', item)?.innerText;
        if (!name) {
            return;
        }
        let attrs: string[] = [];
        ZoR<HTMLSpanElement>('li span', item).forEach(span => {
            attrs.push(span.innerText);
        });
        spec.push({name, attrs});
    });
    const content = Zo<HTMLDivElement>('#description .content')?.innerHTML;
    let images: string[] = [];
    ZoR<HTMLImageElement>('#J_UlThumb li img', box).forEach(img => {
        images.push(img.src);
    });
    const thumb = Zo<HTMLImageElement>('#J_ImgBooth')?.src;
    return {id, title, description, price, thumb, images, spec, content};
}

function getJD() {
    const id = window.location.pathname.replace('/', '').replace(/\..+$/, '');
    const title = Zo<HTMLDivElement>('.sku-name')?.innerText;
    const description = Zo<HTMLDivElement>('.news')?.innerText;
    const price = Zo<HTMLDivElement>('.p-price .price')?.innerText.split('-')[0];
    const content = Zo<HTMLDivElement>('#J-detail-content')?.innerHTML;
    const thumb = Zo<HTMLImageElement>('#spec-img')?.src;
    let images = [];
    ZoR<HTMLImageElement>('#spec-list li img').forEach(item => {
        images.push(item.src);
    });
    let spec = [];
    ZoR<HTMLDivElement>('#choose-attrs .p-choose').forEach(item => {
        const name = Zo<HTMLDivElement>('.dt', item)?.innerText.trim();
        if (!name) {
            return;
        }
        let attrs: string[] = [];
        ZoR<HTMLDivElement>('.item a', item).forEach(span => {
            attrs.push(span.innerText);
        });
        spec.push({name, attrs});
    });
    return {id, title, description, price, thumb, images, spec, content};
}

function Zo<T>(tag: string, parent: Document|HTMLElement = document): T {
    return parent.querySelector(tag) as any;
}

function ZoR<T>(tag: string, parent: Document|HTMLElement = document): T[] {
    return parent.querySelectorAll(tag) as any;
}