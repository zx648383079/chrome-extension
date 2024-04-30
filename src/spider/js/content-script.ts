chrome.runtime.onMessage.addListener(function(request, _, sendResponse)
{
    const maps: any = {
        start_goods: ShopProject,
        start_exam: ExamProject,
        collect: CollectProject,
        start_tracker: TrackerProject,
    };
	if (Object.prototype.hasOwnProperty.call(maps, request.cmd)) {
        const func = maps[request.cmd];
        const res = new func().run();
        sendResponse(res ?? '');
    } else {
		sendResponse('我收到你的消息了：'+JSON.stringify(request));
	}
});

function sendMessage(cmd: string| any, data?: any) {
    if (typeof cmd !== 'object') {
        cmd = {cmd, data}
    }
    chrome.runtime.sendMessage(cmd, function(response: any) {
        console.log('收到来自后台的回复：' + response);
    });
}

// @import '_collect.ts'
// @import '_exam.ts'
// @import '_shop.ts'
// @import '_tracker.ts'