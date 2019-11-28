"use strict";
function getCurrentTabId(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        callback && callback(tabs.length ? tabs[0].id : null);
    });
}
function sendMessageToContentScript(message, callback) {
    getCurrentTabId(function (tabId) {
        chrome.tabs.sendMessage(tabId, message, function (response) {
            callback && callback(response);
        });
    });
}
function batchDownload(items, folder) {
    var i = 0;
    var callback = function () {
        if (items.length <= i) {
            return;
        }
        var item = items[i];
        download(item.url ? item.url : createUrl(item.content), folder ? folder + '/' + item.filename : item.filename, function () {
            i++;
            callback();
        });
    };
    callback();
}
function createUrl(content) {
    if (typeof content === 'object') {
        content = JSON.stringify(content);
    }
    var blob = new Blob([content]);
    return URL.createObjectURL(blob);
}
var filename_map = {};
function download(url, filename, success) {
    chrome.downloads.download({
        url: url,
        filename: filename,
        conflictAction: 'uniquify',
        saveAs: false
    }, function (downloadId) {
        if (filename.trim().length > 0) {
            filename_map[downloadId] = filename;
        }
        success && success();
    });
}
function startSpider() {
    sendMessageToContentScript({ cmd: 'start_spider' });
}
chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
    if (request.cmd === 'batch_download') {
        batchDownload(request.files, request.folder);
    }
    else if (request.cmd === 'single_download') {
        download(request.url, request.filename);
    }
    sendResponse('');
});
chrome.downloads.onDeterminingFilename.addListener(function (downloadItem, suggest) {
    if (!filename_map.hasOwnProperty(downloadItem.id)) {
        suggest({
            filename: downloadItem.filename
        });
        return;
    }
    var name = filename_map[downloadItem.id];
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
    title: chrome.i18n.getMessage('menuStart')
});
chrome.contextMenus.onClicked.addListener(function (info) {
    switch (info.menuItemId) {
        case 'start-spider':
            startSpider();
            break;
    }
});
