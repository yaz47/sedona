"use strict";

//Gulp
var gulp = require("gulp");
var rename = require("gulp-rename");
var del = require("del");
var run = require("run-sequence");
var plumber = require("gulp-plumber");

//Оптимизация кода
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");

//Оптимизация изображений
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");

//Сервер
var server = require("browser-sync").create();


//Отчистка для перезаписи без удаленных файлов
gulp.task("clean", function () {
  return del("build");
});


//Копирование всех файлов в сборку, кроме css, html
gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**"
  ], {
    base: "source" //Для копирования файлов вместе с директорией
  })
  .pipe(gulp.dest("build"));
});


//Сборка стилей
gulp.task("style", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});


//Создание svg-sprite
gulp.task("sprite", function () {
  return gulp.src("source/img/icon-*.svg")
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"));
});


//Вставка svg-sprite и копирование html в билд
gulp.task("html", function () {
  return gulp.src("source/*.html")
  .pipe(posthtml([
    include()
  ]))
  .pipe(gulp.dest("build"));
});


//Последовательная сборка в билд
gulp.task("build",  function (done) {
  run("clean", "copy", "style", "sprite", "html", done);
});


//Сервер с live-reload
gulp.task("serve", function () {
  server.init({
    server: "build/"
  });

  gulp.watch("source/sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("source/*.html", ["html"])
    .on("change", server.reload);
});


//Ручные таски

//Оптимизация изображений
gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest("source/img"));
});


//Создание webp
gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("source/img"));
});
