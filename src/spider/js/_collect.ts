class CollectProject implements ISpider {
    public run(): string | void {
        const url = window.location.href;
        const description = document.querySelector('[name="description"]')?.getAttribute('content') || '';
        const keywords = document.querySelector('[name="keywords"]')?.getAttribute('content') || '';
        const title = document.title;
        let logo = 'favicon.ico';
        ZreUtil.findAll<HTMLLinkElement>('link').forEach(item => {
            const name = item.getAttribute('name');
            if (name && (name.indexOf('shortcut') >= 0 || name.indexOf('icon') >= 0)) {
                logo = item.getAttribute('content') as string;
            }
        });
        if (logo.indexOf('//') < 0) {
            logo = url.substring(0, url.indexOf('/', 10) || url.length) + '/' + logo.replace(/^\//, '');
        }
        this.confirm({url, title, logo, keywords, description}, data => {
            if (data.keywords) {
                data.keywords = data.keywords.trim().split(',') as any;
            }
            ZreUtil.post('navigation/admin/page/save', data);
        });
    }

    private confirm<T = any>(data: T|any, cb: (data: T) => void) {
        const box = ZreUtil.dialog(`<form class="_zre-form" onsubmit="return false">
        <input type="text" name="url" placeholder="网址" value="${data.url}">
        <input type="text" name="title" placeholder="标题" value="${data.title}">
        <input type="text" name="keywords" placeholder="关键词" value="${data.keywords}">
        <input type="text" name="logo" placeholder="Logo" value="${data.logo}">
        <textarea name="description" placeholder="描述">${data.description}</textarea>
        <button type="submit">确认收藏</button>
        <button type="reset" class="_zre-dialog-close">取消</button>
    </form>`);
        const form = ZreUtil.find<HTMLFormElement>('form', box);
        form.addEventListener('submit', () => {
            cb(ZreUtil.formValue(form, ['url', 'title', 'keywords', 'logo', 'description']) as any);
            document.body.removeChild(box);
            return false;
        });
        ZreUtil.find('._zre-dialog-close').addEventListener('click', () => {
            document.body.removeChild(box);
        });
    }
}