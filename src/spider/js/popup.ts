const bg = chrome.extension.getBackgroundPage() as any;
document.getElementById('start-goods')?.addEventListener('click', () => {
    bg.startGoods();
});
document.getElementById('start-exam')?.addEventListener('click', () => {
    bg.startExam();
});
document.getElementById('collect')?.addEventListener('click', () => {
    bg.collect();
});