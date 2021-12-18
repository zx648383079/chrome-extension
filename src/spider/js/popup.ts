;(function() {
    const zreBg = chrome.extension.getBackgroundPage() as any;
    document.getElementById('start-goods')?.addEventListener('click', () => {
        zreBg.startGoods();
    });
    document.getElementById('start-exam')?.addEventListener('click', () => {
        zreBg.startExam();
    });
    document.getElementById('collect')?.addEventListener('click', () => {
        zreBg.collect();
    });
})();