class TrackerProject implements ISpider {

    public run(): string | void {
        const data = this.render();
        if (!data) {
            return;
        }
        ZreUtil.post('tracker/admin/log/crawl', data);
    }

    public render(): any {
        switch(window.location.host) {
            case 'buff.163.com':
                return this.renderBuff();
            case 'www.iflow.work':
            case 'iflow.work':
                return this.renderIFlow();
            default:
                console.log('无相关程序');
                return;
        }
    }

    private renderIFlow() {
        const idChannel = 'steam';
        const table = ZreUtil.find<HTMLTableElement>('.table-responsive table');
        const items: any[] = [];
        const now = new Date().getTime() / 1000;
        ZreUtil.each(table.tBodies, body => {
            ZreUtil.each(body.rows, tr => {
                if (tr.classList.contains('detail-row')) {
                    const orderMap: any = {};
                    const children: any[] = [];
                    const id = tr.getAttribute('buff_id');
                    ZreUtil.findAll('p', tr).forEach(p => {
                        const args = p.innerText.replace('：', ':').split(':');
                        const channel = args[0].split(' ')[0].toLowerCase();
                        const type = args[0].indexOf('求购') ? 0 : 1;
                        const price = args[1].split('(')[0];
                        if (args[0].indexOf('数')) {
                            if (orderMap[channel]) {
                                orderMap[channel][type] = price;
                            } else {
                                orderMap[channel] = {
                                    type: price
                                };
                            }
                            
                        } else {
                            children.push({
                                product: {
                                    id,
                                    channel: idChannel,
                                },
                                price,
                                type,
                                channel  
                            });
                        }
                    });
                    for (const item of children) {
                        if (orderMap[item.channel] && orderMap[item.channel][item.type]) {
                            item.order_count = orderMap[item.channel][item.type];
                        }
                    }
                    items.push(...children);
                    return;
                }
                const id = tr.getAttribute('data-id');
                items.push({
                    product: {
                        id,
                        channel: idChannel,
                    },
                    price: tr.cells[3].innerText,
                    order_count: tr.cells[2].innerText,
                    channel: ZreUtil.find<HTMLLinkElement>('a', tr.cells[8]).getAttribute('href'),
                    created_at: this.formatTime(now, tr.cells[10].innerText)
                })
            });
        });
        return {
            from: 'iflow.work',
            items
        };
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
            product: {
                id,
                channel: 'buff',
            },
            price: this.formatPrice(ZreUtil.find('.detail-summ .f_Strong').innerText)
        });
        ZreUtil.findAll('#relative-goods a').forEach(item => {
            items.push({
                channel: 'buff',
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

    private formatTime(base: number, val: string): number {
        const match = val.match(/((\d+)m\s*)?(\d+)s/);
        if (!match) {
            return base;
        }
        if (match[2]) {
            base -= parseInt(match[2]) * 60;
        }
        return base - parseInt(match[3]);
    }
}