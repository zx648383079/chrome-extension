interface ISteamSpiderConfig {
    host: string;
    pathRegex?: RegExp,
    steamPriceTag: string;
    listTag: string;
    listPriceTag: string;
}

class SteamTooler {
    constructor(
        private option: ISteamSpiderConfig,
        auto = true,
    ) {
        const target = document.querySelector(option.steamPriceTag);
        if (!target) {
            return;
        }
        this.steamPrice = this.parseNumber(target.textContent);
        this.bindEvent(target as HTMLElement);
        if (!auto) {
            this.tapUpdateItem();
            return;
        }
        this.waitTdUpdate(this.updateItemPrice.bind(this));
        this.createUI();
    }

    private steamIncomeScale = .85;
    private steamPrice: number = 0;
    private get steamIncome(): number {
        return this.steamPrice * this.steamIncomeScale;
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

    private tapUpdateItem() {
        this.updateItemPrice(document.querySelectorAll(this.option.listTag + ' ' + this.option.listPriceTag));
    }

    private getIncomeScale(price: number|string) {
        if (!this.steamPrice) {
            return 0;
        }
        return (this.parseNumber(price) * 10 / this.steamIncome).toFixed(2);
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
        return parseFloat(val.match(/[\d\.]+/)[0]);
    }

    private appendTip(target: Node, val: any) {
        const cls = 'zre-tooltip';
        const next = target.nextSibling;
        if (next && next instanceof HTMLElement && next.classList.contains(cls)) {
            next.innerText = `收益率: ${val}`;
            return;
        }
        const tip = document.createElement('p');
        tip.classList.add(cls);
        tip.innerText = `收益率: ${val}`;
        this.insertAfter(target, tip);
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
                    this.tapUpdateItem();
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
                toolItems[i].value = (this.parseNumber(toolItems[0].value) / (this.parseNumber(toolItems[2].value) * this.steamIncomeScale)).toFixed(2);
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

    public static createAuto(auto = true): SteamTooler| undefined {
        const configs: ISteamSpiderConfig[] = [
            {
                host: 'buff.163.com',
                pathRegex: /^\/goods/,
                steamPriceTag: '.detail-header .detail-summ .f_Strong',
                listTag: '.detail-tab-cont',
                listPriceTag: '.t_Left .f_Strong',
            },
            {
                host: 'www.youpin898.com',
                pathRegex: /^\/goodInfo/,
                steamPriceTag: '.goodInfo .f20',
                listTag: '.tab-body',
                listPriceTag: '.list .f20',
            }
        ];
        for (const item of configs) {
            if (item.host !== window.location.host) {
                continue;
            }
            if (item.pathRegex && item.pathRegex.test(window.location.pathname)) {
                return new SteamTooler(item, auto);
            }
            return;
        }
        return;
    }
}