'use strict';

import plugins  from 'gulp-load-plugins';
import yargs    from 'yargs';
import browser  from 'browser-sync';
import gulp     from 'gulp';
import rimraf   from 'rimraf';
import yaml     from 'js-yaml';
import fs       from 'fs';
import notifier from 'node-notifier';
import path     from 'path';

// for webpack
import webpackConfig from './webpack.config.babel.js';
import webpackStream from 'webpack-stream';
import webpack       from 'webpack';

const env = {
    dev: true
};
let wpConfig = webpackConfig(env);

// Load all Gulp plugins into one variable
const $ = plugins();

// Check for --production flag
let PRODUCTION = !!(yargs.argv.production);

// Load settings from settings.yml
const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();

function loadConfig() {
  let ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

gulp.task('build',
    gulp.series(
        gulp.parallel(
            pages,
            sass,
            // webpackBuild,
            // foundation,
            images
        )
    )
);

// ステージや本番はこれ
gulp.task('dist',
    gulp.series(clean, 'build')
);

// 開発する人は基本これを実行すればよい
gulp.task('watch',
    gulp.series(
        // configureTarget,
        'build',
        watch
    )
);

// デザイナーはこっち
gulp.task('server',
    gulp.series(server, 'watch')
);

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
    PRODUCTION = true;
    if (PRODUCTION) {
        rimraf(PATHS.dist, done);
    }
}

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
function copy() {
  return gulp.src(PATHS.assets)
    .pipe(gulp.dest(PATHS.dist + '/assets'));
}

// Copy page templates into finished HTML files
function pages() {
  return gulp.src('src/pages/**/*.{html,hbs,handlebars}')
    .pipe($.if(PRODUCTION,
        gulp.dest(PATHS.dist),
        gulp.dest(PATHS.target))
    );
}


// Compile Sass into CSS
// In production, the CSS is compressed
function sass() {
  return gulp.src('src/assets/scss/app.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: PATHS.sass
       }).on('error', (err) => {
          notify('css error', 'sassのコンパイルでコケてる\nログにエラー箇所が表示されてるよ');
          $.sass.logError(err);
        })
     )
    .pipe($.autoprefixer({
      browsers: COMPATIBILITY
    }))
    // Comment in the pipe below to run UnCSS in production
    //.pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
    .pipe($.if(PRODUCTION, $.cleanCss({ compatibility: 'ie9' })))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe($.if(PRODUCTION,
        gulp.dest(PATHS.dist + '/assets/css'),
        gulp.dest(PATHS.target + '/assets/css'))
    )
    .pipe(browser.reload({ stream: true }));
}


// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
  return gulp.src('src/assets/img/**/*')
    .pipe($.if(PRODUCTION, $.imagemin({
      progressive: true
    })))
    .pipe($.if(PRODUCTION,
        gulp.dest(PATHS.dist + '/assets/img'),
        gulp.dest(PATHS.target + '/assets/img'))
    );
}

function webpackBuild() {
    // const env = {
    //     prod: PRODUCTION === true
    // };
    // const config = webpackConfig(env);
    //const config = require('./webpack.config.babel.js')(env);
    // return gulp.src("./src/assets/js/main/**/*.js")
    webpackStream(wpConfig, webpack)
        .on('error', error => {
            // エラーを吐くとwatchが止まるのでerrorをキャッチしてemitで継続するようにする
            //  this.emit('end'); // Recover from errors
        })
        .pipe($.if(PRODUCTION,
            gulp.dest(PATHS.dist),
            gulp.dest(PATHS.target))
        )
        ;
}

// Start a server with BrowserSync to preview the site in
function server(done) {
  browser.init({
    server: PATHS.target, port: PORT
  });
  done();
}

// Reload the browser with BrowserSync
function reload(done) {
  browser.reload();
  done();
}

function notify(title, message) {
    notifier.notify({
        title: title,
        message: message,
        sound: true,
        icon: path.join(__dirname, 'tool_icon', 'gulp.png')
    });
}

function configureDist() {
    PRODUCTION = true;
    env.dev = !PRODUCTION;
    wpConfig = webpackConfig(env);
}

function configureTarget() {
    PRODUCTION = false;
    env.dev = !PRODUCTION;
    wpConfig = webpackConfig(env);
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
    // gulp.watch(PATHS.assets, copy);
    gulp.watch('src/pages/**/*.html').on('all', gulp.series(pages, browser.reload));
    gulp.watch('src/{layouts,partials}/**/*.html').on('all', gulp.series(pages, browser.reload));
    gulp.watch('src/assets/scss/**/*.scss').on('all', sass);
    // gulp.watch('src/assets/js/**/*.js').on('all', gulp.series(javascript, browser.reload));
    // gulp.watch('src/assets/js/**/*.es6').on('all', gulp.series(babel, browser.reload));
    // gulp.watch('src/assets/js/main.**/*.js').on('all', gulp.series(webpackBuild, browser.reload));
    gulp.watch('src/assets/img/**/*').on('all', gulp.series(images, browser.reload));
    // gulp.watch('src/styleguide/**').on('all', gulp.series(styleGuide, browser.reload));
}



