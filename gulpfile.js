"use strict"

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require("gulp-autoprefixer");//べンダープレフィックス
const sassGlob = require("gulp-sass-glob");//import文を短くまとめる
const cleanCSS = require('gulp-clean-css');//cssフォーマッタ
const notify = require('gulp-notify');//エラーを通知
const plumber = require('gulp-plumber');//watch中にエラー防止
const sourcemaps = require('gulp-sourcemaps');//ソースマップ
const ejs = require("gulp-ejs");//EJS
const rename = require('gulp-rename');//リネーム
const replace = require("gulp-replace");//置換
const browserSync = require("browser-sync");//自動リロード
const del = require('del');//削除

// paths
const paths = {
  src: 'src',
  dist: 'dist'
}

//scssコンパイル
gulp.task("sass", () => {
    return gulp.src(paths.src + "/scss/**/*.scss")
      .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
      .pipe(sourcemaps.init())
      .pipe(sassGlob())
      .pipe(sass())
      .pipe(autoprefixer({
        grid: true
      }))
      .pipe(cleanCSS({format: 'beautify'}))
      .pipe(sourcemaps.write(""))
      .pipe(gulp.dest(paths.dist + "/css"))
      .pipe(notify({
        title: 'Sassをコンパイルしました。',
        message: new Date(),
        sound: 'Tink',
    }))
})

//EJS
gulp.task("ejs", () => {
    return gulp.src([paths.src + "/ejs/**/*.ejs", "!" + paths.src + "/ejs/**/_*.ejs"])
    .pipe(ejs({}, {}, {ext:'.html'}))
    .pipe(rename({ extname: ".html" }))
    .pipe(replace(/[\s\S]*?(<!DOCTYPE)/, "$1"))
    .pipe(gulp.dest(paths.dist))
    .pipe(notify({
      title: 'EJSをコンパイルしました。',
      message: new Date(),
      sound: 'Tink',
  }))
})

// server
gulp.task('browser-sync', () => {
    return browserSync.init({
        server: {
            baseDir: paths.dist
        },
        port: 4000,
        reloadOnRestart: true
    })
})

// reload
gulp.task("reload", done => {
  browserSync.reload()
  done()
})

// clean
gulp.task('clean', (done) => {
  del(paths.dist + '/**/*');
  done();
});

// watch
gulp.task("watch", done => {
  gulp.watch(paths.src + "/scss/**/*.scss", gulp.series('sass', 'ejs', 'reload'))
  gulp.watch(paths.src + "/ejs/**/*.ejs", gulp.series('ejs', 'reload'))
  done()
})

// gulp
gulp.task('default',
  gulp.parallel('watch', 'browser-sync')
)

// build
gulp.task('build',
    gulp.series('clean',
        gulp.series('sass',
            gulp.series('ejs',)))
)