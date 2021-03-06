const gulp = require('gulp');
const sass = require('gulp-sass');							//sass
const browserSync = require('browser-sync').create();		//runtime watcher and changer
const clean = require('gulp-clean');						//cleaner product directory "dev"
const cleanCSS = require('gulp-clean-css');					//CSS minifier
const sourcemaps = require('gulp-sourcemaps');				//SCSS navigation in Chrome inspector
const rename = require("gulp-rename");						//rename files after minify
const concat = require('gulp-concat');						//concat for js
const terser = require('gulp-terser');						//minify for js
const autoprefixer = require('gulp-autoprefixer');			//cross-browser compatibility css
const babel = require('gulp-babel');						//cross-browser compatibility js
const nunjucks = require('gulp-nunjucks-render');           //template engine
const imageMin = require('gulp-imagemin');

const imgFiles = [
    './src/img/**/**.jpg',
    './src/img/**/**.png'
];

function cleandev() {										//модуль отчистки папки перед каждой расспаковкой
    return gulp.src('./dist','./*.html', {read: false})
        .pipe(clean())
}

function img() {											//модуль переноса картинок
    return gulp.src(imgFiles)
        .pipe(imageMin())
        .pipe(gulp.dest('./dist/img'))
}

function buildhtml () {										//Copy index.html to dir "dev"
    return gulp.src('./src/*.html')
        .pipe(nunjucks({                                // Шаблонизатор (сборка index.html из секций по шаблону)
            path: 'src/'
        }))
        .pipe(gulp.dest('./'))
        .pipe(browserSync.stream());
}

function jq () {
    return gulp.src('./src/js/*.js')
        .pipe(gulp.dest('./dist/js'))
}

function scripts () {
    return gulp.src('src/sections/**/*.js')
        .pipe(babel({											//babel
            presets: ['@babel/env']
        }))
        .pipe(terser())														//minify js
        .pipe(concat('all.js'))									//concat all js files
        .pipe(rename(function (path) {							// function of rename extname for .css
            path.extname = ".min.js";
        }))
        .pipe(gulp.dest('./dist/js'))
        .pipe(browserSync.stream());
}

function forSass() {
    return gulp.src('./src/scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(cleanCSS({level: 2}))								// minifyCSS after sourcemaps and sass
        .pipe(autoprefixer({
            browsers: ['> 0.1%'],								// для браузеров которые использует 0.1%
            cascade: false
        }))
        .pipe(rename(function (path) {							// function of rename extname for .css
            path.extname = ".min.css";
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream());
}

function watch() {
    browserSync.init({											// инструмент для live reload
        server: {
            baseDir: "./"
        }
    });

    gulp.watch('./src/**/*.scss', forSass);				// ставим watcher для слежения за изменениями в файлах
    gulp.watch('./src/**/*.js', scripts);
    gulp.watch('./src/**/*.html', buildhtml);
}

gulp.task('cleandev', cleandev);
gulp.task('img', img);
gulp.task('buildHtml', buildhtml);
gulp.task('scripts', scripts);
gulp.task('sass', forSass);
gulp.task('watch', watch);
gulp.task('jq', jq);
gulp.task('build', gulp.series('cleandev', gulp.series(img, buildhtml, jq, scripts, forSass)));
gulp.task('dev', gulp.series('build', watch));
