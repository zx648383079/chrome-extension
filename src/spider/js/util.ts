// @import '_configs.ts'

class ZreUtil {
    public static find<T = HTMLDivElement>(tag: string, parent: Document|HTMLElement = document): T {
        return parent.querySelector(tag) as any;
    }

    public static findAll<T = HTMLDivElement>(tag: string, parent: Document|HTMLElement = document): T[] {
        return parent.querySelectorAll(tag) as any;
    }

    public static toggleClass(ele: HTMLElement, tag: string, force?: boolean) {
        if (force === void 0) {
            force = !ele.classList.contains(tag);
        }
        if (force) {
            ele.classList.add(tag);
            return;
        }
        ele.classList.remove(tag);
    }

    public static index(node: Node): number {
        if (!node.parentNode) {
            return -1;
        }
        const parent = node.parentNode;
        for (let i = 0; i < parent.childNodes.length; i++) {
            if (parent.childNodes[i] === node) {
                return i;
            }
        }
        return -1;
    }

    public static inputValue(form: HTMLFormElement, name: string): string;
    public static inputValue(form: HTMLFormElement, name: string, val: any): void;
    public static inputValue(form: HTMLFormElement, name: string, val?: any): string|void {
        const input = form.elements.namedItem(name);
        if (typeof val === 'undefined') {
            return (input as any)?.value ?? '';
        }
        (input as HTMLInputElement).value = val;
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

    public static post<T = any>(url: string, data: any, log?: (...args: any[]) => void): Promise<T> {
        if (!log) {
            log = console.log;
        }
        return chrome.storage.local.get({token: ''}).then(configs => {
            if (!configs.token) {
                log('请先设置token');
                throw new Error('请先设置token');
            }
            if (url.indexOf('://') < 0) {
                const timestamp = new Date().toString();
                url = `${environment.apiEndpoint}${url}?appid=${environment.appid}&timestamp=${timestamp}`;
            }
            log('crawl sending...');
            return this.request({
                url,
                method: 'post',
                body: JSON.stringify(data),
                headers: {
                    'content-type': 'application/json',
                    'Authorization': 'Bearer ' + configs.token
                }
            }).then(res => {
                log(200, res);
                return JSON.parse(res);
            }, res => {
                log(400, res);
                return res;
            });
        });
    }

    public static request(option: {
        url: string;
        headers?: {
            [key: string]: string
        },
        body?: string|FormData;
        method?: 'get'|'post'|'delete',
    }) {
        return new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(option.method ?? 'get', option.url);
            if (option.headers) {
                for (const key in option.headers) {
                    if (Object.prototype.hasOwnProperty.call(option.headers, key)) {
                        xhr.setRequestHeader(key, option.headers[key]);
                    }
                }
            }
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                }
            };
            xhr.onerror = () => {
                reject(xhr.responseText);
            };
            xhr.ontimeout = () => {
                reject('timeout');
            }
            xhr.send(option.body);
        });
    }

    public static dialog(html: string): HTMLDivElement {
        const box = document.createElement('div');
        box.className = '_zre-dialog-box';
        box.innerHTML = html;
        document.body.appendChild(box);
        return box;
    }
}