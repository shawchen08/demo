var demoPath = [
    // './demos/demo1',
    // './demos/Carousel',
    './demos/canvas-test'
];

var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')();



demoPath.forEach(function(demo) {
    var matchSass = demo + '/sass/**/*.scss',
        matchJs1 = demo + '/js/**/*.js',//匹配处理前js
        cssPath = demo + '/dist/css',
        jsPath = demo + '/dist/js',
        macthCss = demo + '/dist/**/*.css',
        macthJs2 = demo + '/dist/**/*.js';//匹配处理后js
    
    gulp.task('clean-js', function() {
        return gulp.src(macthJs2, {read: false})
            .pipe(plugins.clean());
    });
    gulp.task('clean-css', function() {
        return gulp.src(macthCss, {read: false})
            .pipe(plugins.clean());
    });

    gulp.task('js', ['clean-js'], function() {
        return gulp.src(matchJs1)
            .pipe(plugins.concat('all.js'))
            .pipe(gulp.dest(jsPath))
            .pipe(plugins.uglify())
            .pipe(plugins.rename({extname: '.min.js'}))
            .pipe(gulp.dest(jsPath));
    });

    gulp.task('sass', ['clean-css'], function() {
        return gulp.src(matchSass)
            .pipe(plugins.autoprefixer({
                browsers: ['last 4 versions', 'Android >= 4.0'],
                cascade: true, //是否美化属性值 默认：true 像这样：
                //-webkit-transform: rotate(45deg);
                //        transform: rotate(45deg);
                remove:true //是否去掉不必要的前缀 默认：true 
            }))
            .pipe(plugins.sass({outputStyle: 'expanded'}).on('error', plugins.sass.logError))
            .pipe(plugins.concat('all.css'))
            .pipe(gulp.dest(cssPath))
            .pipe(plugins.cleanCss())
            .pipe(plugins.rename({extname: '.min.css'}))
            .pipe(gulp.dest(cssPath));
    });

    gulp.task('watch', function() {
        gulp.watch(matchSass, ['sass']);
        gulp.watch(matchJs1, ['js']);
    });

    gulp.task('default', ['js', 'sass', 'watch']);
});