(function() {
    const form = document.querySelector('._zre-form') as HTMLFormElement;
    if (!form) {
        return;
    }
    const saveToken = (token: string) => {
        if (!token || token.trim().length < 1) {
            chrome.storage.local.remove('token', () => {});
            return;
        }
        chrome.storage.local.set({token}, () => {
            alert('保存成功');
        });
    };
    const getToken = () => {
        chrome.storage.local.get({token: ''}, configs => {
            if (!configs.token) {
                return;
            }
            ZreUtil.inputValue(form, 'token', configs.token);
        });
    };
    form.addEventListener('submit', () => {
        saveToken(ZreUtil.inputValue(form, 'token'));
        return false;
    });
    getToken();
})();