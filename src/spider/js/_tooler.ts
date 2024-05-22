interface ISteamSpiderConfig {
    host: string;
    pathRegex?: RegExp,
    steamPriceTag: string;
    steamUrl: string;
    listTag: string;
    listPriceTag: string;
}

class SteamTooler {
    constructor(
        private option: ISteamSpiderConfig
    ) {

        this.isDetailPage = !!this.option.pathRegex && this.option.pathRegex.test(window.location.pathname);
    }

    private steamIncomeScale = .85;
    private currency = 23; // CNY
    private steamPrice: number = 0;
    private isDetailPage = false;
    

    /**
     * 手动触发
     * @returns 
     */
    public tapRun() {
        const target = document.querySelector(this.option.steamPriceTag);
        if (!target) {
            return;
        }
        this.steamPrice = this.parseNumber(target.textContent);
        this.bindEvent(target as HTMLElement);
        this.tapUpdateItem();
    }

    /**
     * 页面加载自动运行
     * @returns 
     */
    public autoRun() {
        if (this.isDetailPage) {
            const target = document.querySelector(this.option.steamPriceTag);
            if (!target) {
                return;
            }
            this.steamPrice = this.parseNumber(target.textContent);
            this.bindEvent(target as HTMLElement);
            this.waitTdUpdate(this.updateItemPrice.bind(this));
        }
        this.createUI();
    }

    private runInList() {
        if (window.location.host !== 'buff.163.com' || window.location.pathname.indexOf('market') < 0) {
            return;
        }
        const eleMap: {
            [key: string]: HTMLLIElement
        } = {};
        ZreUtil.findAll<HTMLLIElement>('#j_list_card li').forEach(li => {
            const link = li.querySelector('a');
            const productId = this.parseNumber(link?.getAttribute('href'));
            eleMap[productId] = li;
        });
        ZreUtil.post<{
            data: {
                product: string,
                price: number
            }[]
        }>('tracker/log/batch', {
            channel: 'buff',
            product: Object.keys(eleMap),
            to: 'steam'
        }).then(res => {
            if (!res.data) {
                return;
            }
            for (const item of res.data) {
                const li = eleMap[item.product];
                const priceNode = li.querySelector('.f_Strong') as HTMLSpanElement;
                this.appendTip(priceNode, this.formatIncomeScale(priceNode.innerText, item.price), 'span');
            }
        });
    }

    private bindEvent(target: HTMLElement) {
        const onceTag = '_zre_tooler';
        if (target.getAttribute(onceTag)) {
            return;
        }
        target.setAttribute(onceTag, '1');
        target.addEventListener('click', () => {
            const price = window.prompt('请输入Steam市场实时价格:');
            if (!price) {
                return;
            }
            this.steamPrice = this.parseNumber(price);
            this.tapUpdateItem();
        });
    }

    /**
     * 更新页面上价格比例
     */
    private tapUpdateItem() {
        this.updateItemPrice(document.querySelectorAll(this.option.listTag + ' ' + this.option.listPriceTag));
    }

    private getIncomeScale(price: number|string) {
        return this.formatIncomeScale(price, this.steamPrice);
    }

    private formatIncomeScale(price: number|string, steamPrice: string|number): string {
        if (!steamPrice) {
            return '-';
        }
        return (this.parseNumber(price)/ (this.parseNumber(steamPrice) * this.steamIncomeScale)).toFixed(2);
    }

    private updateItemPrice(items: NodeListOf<Element>) {
        for (let i = 0; i < items.length; i++) {
            const element = items[i];
            this.appendTip(element, this.getIncomeScale((element as any).textContent));
        }
    }

    private waitTdUpdate(cb: (items: NodeListOf<Element>) => void) {
        const table = document.querySelector(this.option.listTag);
        if (!table) {
            return;
        }
        const observer = new MutationObserver(() => {
            cb.call(this, table.querySelectorAll(this.option.listPriceTag));
        });
        observer.observe(table, {childList: true});
    }

    private parseNumber(val: any): number {
        if (!val) {
            return 0;
        }
        if (typeof val === 'number') {
            return val;
        }
        return parseFloat(val.toString().match(/[\d\.]+/)[0]);
    }

    private appendTip(target: Node, val: any, tagName = 'p') {
        const cls = 'zre-tooltip';
        const next = target.nextSibling;
        if (next && next instanceof HTMLElement && next.classList.contains(cls)) {
            next.innerText = `收益率: ${val}`;
            return;
        }
        const tip = document.createElement(tagName);
        tip.classList.add(cls);
        tip.innerText = `收益率: ${val}`;
        this.insertAfter(target, tip);
    }

    private loadSteamPrice(isSell = true) {
        // fetch(this.option.steamUrl).then(res => {});
        const box = ZreUtil.find(isSell ? '#market_commodity_forsale_table' : '#market_commodity_buyreqeusts_table');
        const table = box.getElementsByTagName('table')[0];
        const items: any[] = [];
        ZreUtil.each(table.rows, (row, i) => {
            if (i === 0 || i === table.rows.length - 1) {
                return;
            }
            const price = row.cells[0].innerText.trim();
            items.push({
                currency: price.charAt(0),
                price: this.parseNumber(price),
                amount: this.parseNumber(row.cells[1].innerText)
            });
        });
        return items;
    }

    private getSteamPrice(appid: number, hashName: string) {
        return ZreUtil.request({
            url: `https://steamcommunity.com/market/priceoverview/?appid=${appid}&currency=${this.currency}&market_hash_name=${hashName}`,
            headers: {
                "referer": `https://steamcommunity.com/market/listings/${appid}/${hashName}`,
                "X-Requested-With": "XMLHttpRequest",
                "Host": "steamcommunity.com",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35"
            },
        }).then(res => {
            const data: any = JSON.parse(res);
            if (data.success) {
                return data;
            }
            throw new Error('');
        });
    }

    private createUI() {
        this.hideUI();
        const box = document.createElement('div');
        box.innerHTML = this.createIconBar() + this.createToolbar() + this.createPriceTable();
        document.body.appendChild(box);
        this.bindUIEvent(box);
    }

    private hideUI() {
        const target = ZreUtil.find<HTMLDivElement>('.floatbar');
        if (target) {
            target.style.display = 'none';
        }
    }

    private bindUIEvent(target: HTMLDivElement) {
        ZreUtil.findAll<HTMLLinkElement>('._zre-toolbar a', target).forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                const attr = item.getAttribute('_zre-modal');
                if (attr === 'eye') {
                    if (this.isDetailPage) {
                        this.tapUpdateItem();
                    } else {
                        this.runInList();
                    }
                    return;
                }
                ZreUtil.toggleClass(ZreUtil.find<HTMLDivElement>(`._zre-${attr}-modal`, target), '_zre-opened', true);
            });
        });
        ZreUtil.findAll<HTMLDivElement>('._zre-dialog-box ._zre-dialog-close', target).forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                ZreUtil.toggleClass(item.closest('._zre-dialog-box')!, '_zre-opened', false);
            });
        });

        const toolItems = ZreUtil.findAll<HTMLInputElement>('._zre-input-header-block input', target);
        let matchKey = -1;
        let lastKey = -1;
        const changeData = (key: number, target: number) => {
            if (key === target || key < 0 || target < 0) {
                return;
            }
            if (!toolItems[key].value || !toolItems[target].value) {
                return;
            }
            const i = 3 - key - target;
            if (i < 1) {
                toolItems[i].value = (this.parseNumber(toolItems[2].value) * this.steamIncomeScale * this.parseNumber(toolItems[1].value)).toFixed(2);
            } else if (i == 1) {
                toolItems[i].value = this.formatIncomeScale(toolItems[0].value, toolItems[2].value);
            } else {
                toolItems[i].value = (this.parseNumber(toolItems[0].value) / this.parseNumber(toolItems[1].value) / this.steamIncomeScale).toFixed(2);
            }
            ZreUtil.toggleClass(toolItems[i].closest('._zre-input-header-block')!, '_zre-input-not-empty', true);
        };
        toolItems.forEach((item, i) => {
            // item.addEventListener('focus', () => {
            //     ZreUtil.toggleClass(item.closest('._zre-input-header-block')!, '_zre-input-not-empty', true);
            // });
            item.addEventListener('blur', () => {
                ZreUtil.toggleClass(item.closest('._zre-input-header-block')!, '_zre-input-not-empty', !!item.value);
                if (i !== lastKey) {
                    matchKey = lastKey;
                    lastKey = i;
                }
                changeData(matchKey, lastKey);
            });
        });
        ZreUtil.find('._zre-input-flex-group ._zre-btn', target).addEventListener('click', e => {
            e.preventDefault();
            toolItems.forEach(item => item.value = '');
        });
    }

    private createIconBar() {
        return `<div class="_zre-toolbar">
            <a title="打开转换工具" _zre-modal="exchange"><i class="_zre-iconfont icon-exchange"></i></a>
            <a title="查看Steam出售" _zre-modal="price"><i class="_zre-iconfont icon-list"></i></a>
            <a title="显示比例" _zre-modal="eye"><i class="_zre-iconfont icon-eye"></i></a>
        </div>`;
    }

    private createToolbar() {
        return `
        <div class="_zre-dialog-box _zre-exchange-modal">
            <div class="_zre-dialog-header">
                <div class="dialog-title">Steam价格转换</div>
                <i class="_zre-iconfont _zre-dialog-close"></i>
            </div>
            <div class="_zre-dialog-body">
                <div class="_zre-input-flex-group">
                    <div class="_zre-input-header-block">
                        <input type="number" name="buy_price">
                        <label for="">交易平台价</label>
                    </div>
                    <div class="_zre-input-header-block">
                        <input type="number" name="discount">
                        <label for="">折扣</label>
                    </div>
                    <div class="_zre-input-header-block">
                        <input type="number" name="sell_price">
                        <label for="">Steam价</label>
                    </div>
                    <button class="_zre-btn">
                        <i class="_zre-iconfont icon-refresh"></i>
                    </button>
                </div>
            </div>
        </div>`;
    }

    private createPriceTable() {
        if (!this.isDetailPage) {
            return '';
        }
        return `
        <div class="_zre-dialog-box _zre-price-modal">
            <div class="_zre-dialog-header">
                <div class="dialog-title">Steam在售</div>
                <i class="_zre-iconfont _zre-dialog-close"></i>
            </div>
            <div class="_zre-dialog-body">
                <table class="_zre-table">
                    <thead>
                        <tr>
                            <th>价格</th>
                            <th>比例</th>
                            <th>数量</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>￥</td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>`;
    }

    /**
     * 在子节点最后添加元素
     * @param current 
     * @param items 
     */
    private insertLast(current: Node, items: Node[]) {
        for (const item of items) {
            current.appendChild(item);
        }
    }

    /**
     * 在元素之前添加兄弟节点
     * @param current 
     * @param items 
     */
    private insertBefore(current: Node, items: Node[]) {
        const parent = current.parentNode;
        if (!parent) {
            return;
        }
        for (const item of items) {
            parent.insertBefore(item, current);
        }
    }

    /**
     * 在元素之后添加兄弟节点
     * @param current 
     * @param items 
     * @returns 
     */
    private insertAfter(current: Node, ...items: Node[]) {
        if (current.nextSibling) {
            this.insertBefore(current.nextSibling, items);
            return;
        }
        if (!current.parentNode) {
            return;
        }
        this.insertLast(current.parentNode, items);
    }

    public static createAuto(): SteamTooler| undefined {
        const configs: ISteamSpiderConfig[] = [
            {
                host: 'buff.163.com',
                pathRegex: /^\/goods/,
                steamPriceTag: '.detail-header .detail-summ .f_Strong',
                steamUrl: '.detail-header .detail-summ a',
                listTag: '.detail-tab-cont',
                listPriceTag: '.t_Left .f_Strong',
            },
            {
                host: 'www.youpin898.com',
                pathRegex: /^\/goodInfo/,
                steamPriceTag: '.goodInfo .box-c .f20',
                steamUrl: '.goodInfo .box-c a',
                listTag: '.tab-body',
                listPriceTag: '.list .f20',
            }
        ];
        for (const item of configs) {
            if (item.host !== window.location.host) {
                continue;
            }
            return new SteamTooler(item);
        }
        return;
    }
}