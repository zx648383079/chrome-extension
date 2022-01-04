class ZreUtil {

    public static find<T = HTMLDivElement>(tag: string, parent: Document|HTMLElement = document): T {
        return parent.querySelector(tag) as any;
    }

    public static findAll<T = HTMLDivElement>(tag: string, parent: Document|HTMLElement = document): T[] {
        return parent.querySelectorAll(tag) as any;
    }

    public static post(url: string, data: any) {
        chrome.storage.local.get({token: ''}, configs => {
            if (!configs.token) {
                alert('请先设置token');
                return;
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