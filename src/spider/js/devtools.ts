const log = (...args: any[]) => {
    chrome.devtools.inspectedWindow.eval(`console.log(...${JSON.stringify(args)});`);
};

chrome.devtools.network.onRequestFinished.addListener(request => {
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
});