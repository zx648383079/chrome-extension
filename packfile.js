var loader = require("gulp-vue2mini").PackLoader;

loader.task('ts', async() => {
    await loader.input('src/**/*.ts')
        .ts()
        .output('dist/**/');
});

loader.task('sass', async() => {
    await loader.input('src/**/*.{scss,sass}')
        .sass()
        .output('dist/**/');
});

loader.task('copy', async() => {
    await loader.input('src/**/*.{json,html,png,jpg,jpeg}')
        .output('dist/**/');
});

loader.task('default', loader.series('ts', 'sass', 'copy'));