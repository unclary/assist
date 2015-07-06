var gulp = require("gulp")
	, concat = require("gulp-concat") // 拼接
	, uglify = require("gulp-uglify") // 丑化
	, jshint = require("gulp-jshint") // 日志
	, watch = require("gulp-watch")
	;

gulp.task("jquery", function(){
	gulp.src(["common/js/jquery-1.9.1.js", "common/js/seajs-debug.js", "common/js/seajs-config.js"])
		.pipe(jshint())
		.pipe(jshint.reporter("default"))
		.pipe(uglify())
		.pipe(concat("jquery.min.js"))
		.pipe(gulp.dest("common/js"));
});

gulp.task("zepto", function(){
	gulp.src(["common/js/zepto-1.1.6.js", "common/js/seajs-debug.js", "common/js/seajs-config.js"])
		.pipe(jshint())
		.pipe(jshint.reporter("default"))
		.pipe(uglify())
		.pipe(concat("zepto.min.js"))
		.pipe(gulp.dest("common/js"));
});

gulp.task("seajs", function(){
	gulp.src(["common/js/seajs-debug.js", "common/js/seajs-config.js"])
		.pipe(uglify())
		.pipe(concat("seajs.min.js"))
		.pipe(gulp.dest("common/js"));
});

gulp.task("ppt", function(){
	gulp.src(["common/codemirror/lib/codemirror.js", "common/codemirror/mode/xml/xml.js"])
		.pipe(uglify())
		.pipe(concat("web_ppt.js"))
		.pipe(gulp.dest("common/codemirror"))
});