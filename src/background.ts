interface IFile {
    url?: string,
    filename: string,
    content?: any
}

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

function startSpider() {
    sendMessageToContentScript({cmd: 'start_spider'});
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

chrome.contextMenus.removeAll();

chrome.contextMenus.create({
    id: 'start-spider',
    title: chrome.i18n.getMessage('menuStart'),
});

chrome.contextMenus.onClicked.addListener(function(info) {
    switch(info.menuItemId){
        case 'start-spider':
            startSpider();   
            break;
    }
});