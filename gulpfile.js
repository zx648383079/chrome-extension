var gulp = require('gulp'),
    vue2mini = require("gulp-vue2mini");

gulp.task('ts', async() => {
    await gulp.src('src/**/*.ts')
        .pipe(vue2mini.gulpTs())
        .pipe(gulp.dest('dist/'));
});

gulp.task('sass', async() => {
    await gulp.src('src/**/*.{scss,sass}')
        .pipe(vue2mini.gulpSass())
        .pipe(gulp.dest('dist/'));
});

gulp.task('default', gulp.series('ts', 'sass', async() => {
    await gulp.src('src/**/*.{json,html,png,jpg,jpeg}')
        .pipe(gulp.dest('dist/'));
}));