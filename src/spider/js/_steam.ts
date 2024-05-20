// @import '_tooler.ts'

class SteamProject implements ISpider {
    public run(): string | void {
        SteamTooler.createAuto(false);
    }
}