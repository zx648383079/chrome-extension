;(function() {
    const zreBg = chrome.extension.getBackgroundPage() as any;
    const items = document.getElementsByClassName('_zre-menu-bar');
    for (let i = 0; i < items.length; i++) {
        const element = items[i];
        for (let j = 0; j < element.children.length; j++) {
            const item = element.children[j];
            if (item.nodeName === 'LI') {
                item.addEventListener('click', () => {
                    zreBg.sendMessageToContentScript({cmd: item.id});
                });
            }
        }
    }
})();