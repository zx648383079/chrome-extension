function getCurrentTabId(callback: (id?: number) => void) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs: any[]) {
        callback && callback(tabs.length ? tabs[0].id: null);
    });
}
function sendMessageToContentScript(message: any, callback?: (res: any) => void) {
    getCurrentTabId((tabId) => {
        chrome.tabs.sendMessage(tabId, message, function(response: any)
        {
            callback && callback(response);
        });
    });
}

var bg = chrome.extension.getBackgroundPage();
document.getElementById('start-spider')?.addEventListener('click', () => {
    bg.startSpider();
});