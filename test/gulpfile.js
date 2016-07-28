/**
 * 组件安装
 * npm install gulp-util gulp-imagemin gulp-ruby-sass gulp-minify-css gulp-jshint gulp-uglify gulp-rename gulp-concat gulp-clean gulp-livereload tiny-lr --save-dev
 */

var gulp = require('gulp'),//基础库
	imagemin = require('gulp-imagemin'),//图片压缩
	pngquant = require('imagemin-pngquant'),//PNG压缩
	sass = require('gulp-ruby-sass'),//sass
	minifycss = require('gulp-minify-css'),//css压缩
	jshint = require('gulp-jshint'),//js检查
	uglify = require('gulp-uglify'),//js压缩
	clean = require('gulp-clean'),//清空文件夹
	rename = require('gulp-rename'),//重命名
	concat = require('gulp-concat'),//合并文件
	tinylr = require('tiny-lr'),//livereload
	server = tinylr(),
	port = 35729,
	livereload = require('gulp-livereload'),
	rev = require('gulp-rev'),//对文件名加MD5后缀
	revCollector = require('gulp-rev-collector'),//路径替换
	htmlmin = require('gulp-htmlmin');

//样式处理
gulp.task('css', function() {
	var cssSrc = './sass/*.scss',
		cssDst = './dist/css';

	return sass(cssSrc, { style: 'expanded' })
		.pipe(gulp.dest('./css'))
		.pipe(rev())
		.pipe(rename({ suffix: '.min' }))
		.pipe(minifycss())
		.pipe(livereload(server))
		.pipe(gulp.dest(cssDst))
		.pipe(rev.manifest())
		.pipe(gulp.dest('./rev'));

});

//HTML处理
gulp.task('html', function() {
	var htmlSrc = './src/html/**/*.html',
		htmlDst = './dist/html';

	var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };

	gulp.src(['./rev/**/*.json', htmlSrc])
		.pipe(revCollector({
			replaceReved: true,
			revSuffix: /-[0-9a-f]{8,10}.min/,
            dirReplacements: {
                'css': 'dist/css',
            }
		}))
		.pipe(htmlmin(options))
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

//js处理
gulp.task('js', function() {
	var jsSrc = './js/*.js',
		jsDst = './dist/js';

	gulp.src(jsSrc)
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('default'))
		.pipe(concat('main.js'))
		.pipe(gulp.dest('./js'))
		.pipe(rename({ suffix: '.min' }))
		.pipe(uglify())
		.pipe(livereload(server))
		.pipe(gulp.dest(jsDst));

});

//清空图片、样式、js
gulp.task('clean', function() {
    gulp.src(['./dist/css', './dist/js', './dist/images'], {read: false})
    	.pipe(clean());
});

//默认任务 清空图片、样式、js并重建 运行语句gulp
gulp.task('default', ['clean'], function() {
	//gulp.start('html', 'css', 'images', 'js');
	gulp.start('css', 'js', 'html');
});

//监听任务 运行语句gulp watch
gulp.task('watch', function() {

	server.listen(port, function(err) {
		if(err) {
			return console.log(err);
		}

		//监听html
		gulp.watch('./src/html/**/*.html', function(event) {
			gulp.run('html');
		});

		//监听css
		gulp.watch('./sass/*.scss', function() {
			gulp.run('css');
		});

		//监听images
		gulp.watch('./images/**/*', function() {
			gulp.run('images');
		});

		//监听js
		gulp.watch('./js/*.js', function() {
			gulp.run('js');
		});

	});

});