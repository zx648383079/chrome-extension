class ZreUtil {

    public static find<T = HTMLDivElement>(tag: string, parent: Document|HTMLElement = document): T {
        return parent.querySelector(tag) as any;
    }

    public static findAll<T = HTMLDivElement>(tag: string, parent: Document|HTMLElement = document): T[] {
        return parent.querySelectorAll(tag) as any;
    }

    public static post(url: string, data: any) {
        const xhr = new XMLHttpRequest();
        xhr.open('post', url);
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.send(JSON.stringify(data));
        xhr.onreadystatechange = function() {
            console.log(xhr.status);
        };
    }
}