const log = (...args: any[]) => {
    chrome.devtools.inspectedWindow.eval(`console.log(...${JSON.stringify(args)});`);
};

function importBuff(request: chrome.devtools.network.Request) {
    const baseUrl = 'https://buff.163.com/api/market/goods/price_history';
    if (request.request.url.indexOf(baseUrl) !== 0) {
        return;
    }
    let path = request.request.url.substring(baseUrl.length).split('?')[0];
    if (path.length > 0 && path.substring(0,1) == '/') {
        path = path.substring(1);
    }
    if (path.length !== 0 && path !== 'buff') {
        return;
    }
    const product = {
        id: '',
        channel: 'buff',
    };
    for (const item of request.request.queryString) {
        if (item.name === 'goods_id') {
            product.id = item.value;
        }
    }
    request.getContent(res => {
        const data = JSON.parse(res);
        if (data.code !== 'OK') {
            return;
        }
        ZreUtil.post('tracker/admin/log/crawl', {
            from: 'buff',
            items: (data.data.price_history as any[]).map(i => {
                return {
                    product,
                    channel: path === 'buff' ? 'buff' : 'steam',
                    created_at: i[0] / 1000,
                    price: i[1]
                }
            })
        }, log);
    });
}

function importCsqaq(request: chrome.devtools.network.Request) {
    if (request.request.url !== 'https://csqaq.com/proxies/api/v1/info/chart') {
        return;
    }
    log(111);
    chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, tab => {
        log(tab.title);
    });
    const postData = JSON.parse(request.request.postData?.text as string);
    if (['turnover_number', 'buy_price', 'sell_price'].indexOf(postData.key) < 0) {
        return;
    }
    request.getContent(res => {
        const data = JSON.parse(res);
        if (data.code !== 200) {
            return;
        }
        chrome.tabs.get(chrome.devtools.inspectedWindow.tabId/*).query({url: 'https://csqaq.com/goods/' + postData.good_id}*/, tab => {
            const title = tab.title as string;
            const name = title.substring(0, title.lastIndexOf('-'));
            ZreUtil.post('tracker/admin/log/crawl', {
                from: 'csqaq',
                name,
                items: (data.data.main_data as any[]).map((val, i) => {
                    return {
                        channel: ['buff', 'uuyp', 'steam'][postData.platform - 1],
                        created_at: data.data.timestamp[i] / 1000,
                        [postData.key === 'turnover_number' ? 'order_count' : 'price']: val,
                        type: postData.key === 'buy_price' ? 1 : 0,
                    }
                })
            }, log);
        });
        
    });
}

chrome.devtools.network.onRequestFinished.addListener(request => {
    if (request.request.url.indexOf('csqaq') > 0) {
        log(request.request.url);
    }
    importBuff(request);
    importCsqaq(request);
});