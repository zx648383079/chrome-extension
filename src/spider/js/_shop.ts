class ShopProject implements ISpider {
    public run(): string | void {
        const data = this.render();
        if (!data) {
            return;
        }
        ZreUtil.post('shop/admin/goods/crawl', data).then(_ => {});
        return;
        // sendMessage({
        //     cmd: 'batch_download',
        //     files: [
        //         {
        //             content: data,
        //             filename: data.id + '.json',
        //         }
        //     ],
        //     folder: 'shop_goods'
        // });
    }

    public render(): any {
        switch(window.location.host) {
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
    }

    private renderJD() {
        const id = window.location.pathname.replace('/', '').replace(/\..+$/, '');
        const title = ZreUtil.find<HTMLDivElement>('.sku-name')?.innerText;
        const description = ZreUtil.find<HTMLDivElement>('.news')?.innerText;
        const price = ZreUtil.find<HTMLDivElement>('.p-price .price')?.innerText.split('-')[0];
        const content = ZreUtil.find<HTMLDivElement>('#J-detail-content')?.innerHTML;
        const thumb = ZreUtil.find<HTMLImageElement>('#spec-img')?.src;
        let images: string[] = [];
        ZreUtil.findAll<HTMLImageElement>('#spec-list li img').forEach(item => {
            images.push(item.src);
        });
        let attrs: any[] = [];
        ZreUtil.findAll<HTMLDivElement>('#choose-attrs .p-choose').forEach(item => {
            const name = ZreUtil.find<HTMLDivElement>('.dt', item)?.innerText.trim();
            if (!name) {
                return;
            }
            let items: string[] = [];
            ZreUtil.findAll<HTMLDivElement>('.item a', item).forEach(span => {
                items.push(span.innerText);
            });
            attrs.push({name, items});
        });
        const brand = ZreUtil.find<HTMLDivElement>('#parameter-brand a')?.innerText;
        let properties: any[] = [];
        ZreUtil.findAll<HTMLLIElement>('#detail .parameter2 li').forEach(item => {
            const args = item.innerText.split('：');
            if (args.length > 1) {
                properties.push({name: args[0], value: args[1]});
            }
        });
        const category = ZreUtil.find<HTMLLinkElement>('#crumb-wrap .first')?.innerText;
        return {id, title, description, price, thumb, images, attrs, brand, category, properties, content};
    }

    private renderTB() {
        const url = window.location.href;
        const id = url.replace(/^.+id\=/i, '').replace(/&.+$/, '');
        const box = document.getElementById('detail') as HTMLDivElement;
        if (!box) {
            return;
        }
        const title = ZreUtil.find<HTMLDivElement>('#J_Title h3', box)?.innerText;
        const description = ZreUtil.find<HTMLDivElement>('.tb-subtitle', box)?.innerText;
        const price = ZreUtil.find<HTMLDivElement>('#J_PromoPriceNum', box)?.innerText.split('-')[0];
        let attrs: any[] = [];
        ZreUtil.findAll<HTMLDivElement>('#J_isku .tb-prop', box)?.forEach(item => {
            const name = ZreUtil.find<HTMLDivElement>('.tb-property-type', item)?.innerText;
            if (!name) {
                return;
            }
            let items: string[] = [];
            ZreUtil.findAll<HTMLSpanElement>('li a', item).forEach(span => {
                items.push(span.innerText);
            });
            attrs.push({name, items});
        });
        const content = ZreUtil.find<HTMLDivElement>('#description .content')?.innerHTML;
        let images: string[] = [];
        ZreUtil.findAll<HTMLImageElement>('#J_UlThumb li img', box).forEach(img => {
            images.push(img.src);
        });
        const thumb = ZreUtil.find<HTMLImageElement>('#J_ImgBooth')?.src;
        let properties: any[] = [];
        ZreUtil.findAll<HTMLLIElement>('#attributes li').forEach(item => {
            const args = item.innerText.replace('&nbsp;', '').split(':');
            if (args.length > 1) {
                properties.push({name: args[0], value: args[1]});
            }
        });
        return {id, title, description, price, thumb, images, attrs, properties, content};
    }


    private renderTM() {
        const url = window.location.href;
        const id = url.replace(/^.+id\=/i, '').replace(/&.+$/, '');
        const box = document.getElementById('detail') as HTMLDivElement;
        if (!box) {
            return;
        }
        const title = ZreUtil.find<HTMLDivElement>('.tb-detail-hd h1', box)?.innerText;
        const description = ZreUtil.find<HTMLDivElement>('.tb-detail-hd .newp', box)?.innerText;
        const price = ZreUtil.find<HTMLDivElement>('.tm-price', box)?.innerText.split('-')[0];
        let attrs: any[] = [];
        ZreUtil.findAll<HTMLDivElement>('.tb-sku .tm-sale-prop', box)?.forEach(item => {
            const name = ZreUtil.find<HTMLDivElement>('.tb-metatit', item)?.innerText;
            if (!name) {
                return;
            }
            let items: string[] = [];
            ZreUtil.findAll<HTMLSpanElement>('li span', item).forEach(span => {
                items.push(span.innerText);
            });
            attrs.push({name, items});
        });
        const content = ZreUtil.find<HTMLDivElement>('#description .content')?.innerHTML;
        let images: string[] = [];
        ZreUtil.findAll<HTMLImageElement>('#J_UlThumb li img', box).forEach(img => {
            images.push(img.src);
        });
        const thumb = ZreUtil.find<HTMLImageElement>('#J_ImgBooth')?.src;
        const brand = ZreUtil.find<HTMLDivElement>('#J_BrandAttr .J_EbrandLogo')?.innerText;
        let properties: any[] = [];
        ZreUtil.findAll<HTMLLIElement>('#J_AttrUL li').forEach(item => {
            const args = item.innerText.replace('&nbsp;', '').split(':');
            if (args.length > 1) {
                properties.push({name: args[0], value: args[1]});
            }
        });
        return {id, title, description, price, thumb, images, attrs, brand, properties, content};
    }
}