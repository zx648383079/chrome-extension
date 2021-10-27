"use strict";
function getCurrentTabId(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        callback && callback(tabs.length ? tabs[0].id : 0);
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
function startGoods() {
    sendMessageToContentScript({ cmd: 'start_goods' });
}
function collect() {
    sendMessageToContentScript({ cmd: 'collect' });
}
function startExam() {
    sendMessageToContentScript({ cmd: 'start_exam' });
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
    id: 'start-goods',
    title: chrome.i18n.getMessage('startGoods'),
});
chrome.contextMenus.create({
    id: 'start-exam',
    title: chrome.i18n.getMessage('startExam'),
});
chrome.contextMenus.create({
    id: 'collect',
    title: chrome.i18n.getMessage('collect'),
});
chrome.contextMenus.onClicked.addListener(function (info) {
    switch (info.menuItemId) {
        case 'start-goods':
            startGoods();
            break;
        case 'start-exam':
            startExam();
            break;
        case 'collect':
            collect();
            break;
    }
});
