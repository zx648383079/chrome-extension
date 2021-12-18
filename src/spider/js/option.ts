(function() {
    const form = document.querySelector('._zre-form') as HTMLFormElement;
    if (!form) {
        return;
    }
    const saveToken = (token: string) => {
        if (!token || token.trim().length < 1) {
            chrome.storage.local.remove('token').then(() => {});
            return;
        }
        chrome.storage.local.set({token}).then(() => {
            alert('保存成功');
        });
    };
    form.addEventListener('submit', () => {
        saveToken(form.elements['token'].value);
        return false;
    });
})();