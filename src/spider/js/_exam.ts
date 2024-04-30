class ExamProject implements ISpider {
    public run(): string | void {
        let data = this.render();
        if (!data) {
            return;
        }
        ZreUtil.post('exam/admin/question/import', data);
        return;
        // sendMessage({
        //     cmd: 'batch_download',
        //     files: [
        //         {
        //             content: data,
        //             filename: data.id + '.json',
        //         }
        //     ],
        //     folder: 'exam_question'
        // });
    }

    public render(): any {
        switch(window.location.host) {
            case 'www.jiakaobaodian.com':
                return this.renderJK();
            default:
                console.log('无相关程序');
                return;
        }
    }

    public renderJK() {
        const box = ZreUtil.find<HTMLDivElement>('.layout-article');
        if (!box) {
            return;
        }
        const text = ZreUtil.find<HTMLDivElement>('.timu-text', box).innerText;
        const match = text.match(/(\d+)\/\d+、(.+)/);
        if (!match) {
            return;
        }
        const id = match[1];
        const title = match[2];
        const options: any[] = [];
        ZreUtil.findAll<HTMLDivElement>('.options-w p', box).forEach(item => {
            const right = item.classList.contains('success');
            const content = item.innerText.replace(/[A-Z]、/, '');
            options.push({content, right});
        });
        const xjBox = ZreUtil.find<HTMLDivElement>('.xiangjie', box);
        if (!xjBox) {
            return {id, title, options};
        }
        const analysis = ZreUtil.find<HTMLDivElement>('.content', xjBox).innerText;
        const easiness = parseInt(ZreUtil.find<HTMLDivElement>('.bfb', xjBox).style.width.replace('%', '')) / 10;
        return {id, title, options, analysis, easiness};
    }
}