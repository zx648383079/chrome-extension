class TrackerProject implements ISpider {

    public run(): string | void {
        const data = this.render();
        if (!data) {
            return;
        }
        console.log(data);
        ZreUtil.post('tracker/admin/log/import', data);
    }

    public render(): any {
        switch(window.location.host) {
            case 'buff.163.com':
                return this.renderBuff();
            case 'www.iflow.work':
                return this.renderIFlow();
            default:
                console.log('无相关程序');
                return;
        }
    }

    private renderIFlow() {
        const table = ZreUtil.find<HTMLTableElement>('.table-responsive table');
        const items: any[] = [];
        ZreUtil.each(table.tBodies, body => {
            ZreUtil.each(body.rows, tr => {
                if (tr.classList.contains('detail-row')) {
                    const id = tr.getAttribute('buff_id');
                    ZreUtil.findAll('p', tr).forEach(p => {
                        const args = p.innerText.replace('：', ':').split(':');
                        items.push({
                            id,
                            [args[0].indexOf('数') ? 'order_count' : 'price']: args[1].split('(')[0],
                            type: args[0].indexOf('求购') ? 0 : 1,
                            channel: args[0].split(' ')[0].toLowerCase() 
                        });
                    });
                    return;
                }
                const id = tr.getAttribute('data-id');
                items.push({
                    id,
                    price: tr.cells[3].innerText,
                    order_count: tr.cells[2].innerText,
                    channel: ZreUtil.find<HTMLLinkElement>('a', tr.cells[8]).getAttribute('href')
                })
            });
        });
        return items;
    }

    private renderBuff() {
        if (window.location.pathname.indexOf('/goods/') !== 0) {
            return;
        }
        const header = ZreUtil.find<HTMLDivElement>('.detail-cont');
        const name = ZreUtil.find('h1', header).innerText;
        const id = window.location.pathname.substring(7);
        const items: any[] = [];
        items.push({
            channel: 'steam',
            product: id,
            price: this.formatPrice(ZreUtil.find('.detail-summ .f_Strong').innerText)
        });
        ZreUtil.findAll('#relative-goods a').forEach(item => {
            items.push({
                product: item.classList.contains('active') ? id : item.getAttribute('data-goodsid'),
                price: this.formatPrice(item.innerText)
            })
        });
        return {
            from: 'buff',
            name,
            items
        };
    }

    private formatPrice(arg: any): number {
        arg = arg.toString().replace(',', '').match(/[\d\.]+/);
        if (!arg) {
            return 0;
        }
        return parseFloat(arg);
    }
}