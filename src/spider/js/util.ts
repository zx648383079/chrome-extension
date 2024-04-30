class ZreUtil {

    public static find<T = HTMLDivElement>(tag: string, parent: Document|HTMLElement = document): T {
        return parent.querySelector(tag) as any;
    }

    public static findAll<T = HTMLDivElement>(tag: string, parent: Document|HTMLElement = document): T[] {
        return parent.querySelectorAll(tag) as any;
    }

    public static inputValue(form: HTMLFormElement, name: string): string {
        const input = form.elements.namedItem(name);
        return (input as any)?.value ?? '';
    }

    public static each<T extends Element>(items: HTMLCollectionOf<T>, cb: (item: T, index: number) => void|false): void
    public static each<T = HTMLElement>(items: HTMLCollectionBase, cb: (item: T, index: number) => void|false): void {
        for (let index = 0; index < items.length; index++) {
            if (cb(items[index] as any, index) === false) {
                return;
            }
        }
    }

    public static formValue(form: HTMLFormElement, keys: string[]): Object {
        const data: any = {};
        for (const key of keys) {
            data[key] = this.inputValue(form, key);
        }
        return data;
    }

    public static post(url: string, data: any) {
        chrome.storage.local.get({token: ''}, configs => {
            if (!configs.token) {
                alert('请先设置token');
                return;
            }
            if (url.indexOf('://') < 0) {
                url = 'http://zodream.localhost/open/' + url;
            }
            const xhr = new XMLHttpRequest();
            xhr.open('post', url);
            xhr.setRequestHeader('content-type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Bearer ' + configs.token);
            xhr.send(JSON.stringify(data));
            xhr.onreadystatechange = function() {
                console.log(xhr.status);
            };
        });
    }

    public static dialog(html: string): HTMLDivElement {
        const box = document.createElement('div');
        box.className = '_zre-dialog';
        box.innerHTML = html;
        document.body.appendChild(box);
        return box;
    }
}