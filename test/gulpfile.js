/**
 * 组件安装
 * npm install gulp-util gulp-imagemin gulp-ruby-sass gulp-minify-css gulp-jshint gulp-uglify gulp-rename gulp-concat gulp-clean gulp-livereload tiny-lr --save-dev
 */

var gulp = require('gulp'),//基础库
	imagemin = require('gulp-imagemin'),//图片压缩
	pngquant = require('imagemin-pngquant'),//PNG压缩
	sass = require('gulp-ruby-sass'),//sass
	minifycss = require('gulp-minify-css'),//css压缩
	clean = require('gulp-clean'),//清空文件夹
	rename = require('gulp-rename'),//重命名
	tinylr = require('tiny-lr'),//livereload
	server = tinylr(),
	port = 35729,
	livereload = require('gulp-livereload');

//样式处理
gulp.task('css', function() {
	var cssSrc = './sass/*.scss',
		cssDst = './dist/css';

	return sass(cssSrc, { style: 'expanded' })
		.pipe(gulp.dest('./css'))
		.pipe(rename({ suffix: '.min' }))
		.pipe(minifycss())
		.pipe(livereload(server))
		.pipe(gulp.dest(cssDst));

});

//HTML处理
gulp.task('html', function() {
	var htmlSrc = './html/*.html',
		htmlDst = './dist/html';

	gulp.src(htmlSrc)
		.pipe(livereload(server))
		.pipe(gulp.dest(htmlDst));

});

//图片处理
gulp.task('images', function() {
	var imgSrc = './images/**/*',
		imgDst = './dist/images';

	gulp.src(imgSrc)
		.pipe(imagemin({
			//optimizationLevel: 7, //类型：Number  默认：3  取值范围：0-7（优化等级）
            //progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            //interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            //multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
            svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
            use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
		}))
		.pipe(livereload(server))
		.pipe(gulp.dest(imgDst));

});

gulp.task('clean', function() {
    gulp.src(['./dist/css', './dist/js', './dist/images'], {read: false})
    	.pipe(clean());
});

gulp.task('default', ['clean'], function() {
	gulp.start('css', 'images');
});