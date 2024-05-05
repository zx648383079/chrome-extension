interface IFile {
    url?: string,
    filename: string,
    content?: any
}

function getCurrentTabId(callback: (id: number) => void) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs: any[]) {
        callback && callback(tabs.length ? tabs[0].id: 0);
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

function batchDownload(items: IFile[], folder?: string) {
    let i = 0;
    let callback = () => {
        if (items.length <= i) {
            return;
        }
        let item = items[i];
        
        download(item.url ? item.url : createUrl(item.content), folder ? folder + '/' + item.filename : item.filename, () => {
            i ++;
            callback();
        });
    };
    callback();
}

function createUrl(content: string): string {
    if (typeof content === 'object') {
        content = JSON.stringify(content);
    }
    let blob = new Blob([content]);
    return URL.createObjectURL(blob);
}

let filename_map: {[key: number]: string} = {};

function download(url: string, filename: string, success?: () => void) {
    chrome.downloads.download({
        url,
        filename,
        conflictAction: 'uniquify',
        saveAs: false
    }, (downloadId: number) => {
        if (filename.trim().length > 0) {
            filename_map[downloadId] = filename;
        }
        success && success();
    });
}

chrome.runtime.onMessage.addListener(function(request, _, sendResponse)
{
    if (request.cmd === 'batch_download') {
        batchDownload(request.files, request.folder);
    } else if (request.cmd === 'single_download') {
        download(request.url, request.filename);
    }
    sendResponse('');
});

// chrome.runtime.lastError.addListener(function() {
//     console.log(arguments);
    
// });

// chrome.webRequest.onCompleted.addListener(res => {
//     console.log(res);
    
// }, {urls: ['https://buff.163.com/api/market/goods/price_history/*']});

chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
    if (!filename_map.hasOwnProperty(downloadItem.id)) {
        suggest({
            filename: downloadItem.filename
        });
        return;
    }
    let name = filename_map[downloadItem.id];
    if (/\/$/.test(name)) {
        name += downloadItem.filename;
    }
    suggest({
        filename: name
    });
    delete filename_map[downloadItem.id];
});

// chrome.runtime.onInstalled.addListener(function(){
//     chrome.declarativeContent.onPageChanged.removeRules(undefined, function(){
//         chrome.declarativeContent.onPageChanged.addRules([
//             {
//                 conditions: [
//                     new chrome.declarativeContent.PageStateMatcher({pageUrl: {urlContains: 'jd.com'}}),
//                     new chrome.declarativeContent.PageStateMatcher({pageUrl: {urlContains: 'tmall.com'}}),
//                     new chrome.declarativeContent.PageStateMatcher({pageUrl: {urlContains: 'taobao.com'}}),
//                 ],
//                 actions: [new chrome.declarativeContent.ShowPageAction()]
//             }
//         ]);
//     });
// });

chrome.contextMenus.removeAll();

chrome.contextMenus.create({
    id: 'start_goods',
    title: chrome.i18n.getMessage('startGoods'),
});
chrome.contextMenus.create({
    id: 'start_exam',
    title: chrome.i18n.getMessage('startExam'),
});
chrome.contextMenus.create({
    id: 'collect',
    title: chrome.i18n.getMessage('collect'),
});
chrome.contextMenus.create({
    id: 'start_tracker',
    title: chrome.i18n.getMessage('startTracker'),
});
chrome.contextMenus.onClicked.addListener(function(info) {
    switch(info.menuItemId){
        case 'start_goods':
        case 'start_exam':
        case 'collect':
        case 'start_tracker':
            sendMessageToContentScript({cmd: info.menuItemId});
            break;
    }
});

// const response = await fetch('https://www.example.com/greeting.json'')