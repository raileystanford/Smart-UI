const gulp = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cssminify = require('gulp-csso');
const htmlminify = require('gulp-htmlclean');
const browserSync = require('browser-sync').create();
const jsmin = require('gulp-uglify');
const changed = require('gulp-changed');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const pug = require('gulp-pug');
const fse = require("fs-extra");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const path = require('path');


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// CHECK FILE PRESENSE
function checkFilesPresense(src, type) {
   let file = fse.readdirSync(src).find((item) => item.endsWith(type));
   return Boolean(file);
}

// CLEAR DIST FOLDER
gulp.task("cleardist", async function () {
   await fse.emptyDir("./dist");
});

// TRANSFER FILES FROM SRC TO DIST (without scss/pug)
gulp.task("copyfiles", async function () {
   await fse.copy("./src", "./dist", {
      filter: (src) => {
         if (src.includes("/scss") || src.includes("\\scss")) return false;
         if (src.includes("/pug") || src.includes("\\pug")) return false;
         if (src.includes("/pages") || src.includes("\\pages")) return false;
         if (src.endsWith(".pug")) return false;
         return true;
      }
   });
});

// SCSS
gulp.task("scss", function () {
   if (!fse.existsSync("./src/scss")) return Promise.resolve();
   return gulp
      .src("./src/scss/**/*.scss", { allowEmpty: true })
      .pipe(plumber({
         errorHandler: notify.onError({
            title: "SCSS Error",
            message: "<%= error.message %>"
         })
      }))
      .pipe(changed("./dist/css/"))
      .pipe(scss())
      .pipe(gulp.dest("./dist/css"))
      .pipe(browserSync.stream());
});

// PUG COMPILATION TO HTML (ROOT)
gulp.task("pug-root", function () {

   if (!checkFilesPresense('./src', '.pug')) return Promise.resolve();

   return gulp
      .src("src/*.pug", { allowEmpty: true })
      .pipe(plumber({
         errorHandler: notify.onError({
            title: "PUG Error",
            message: "<%= error.message %>"
         })
      }))
      .pipe(pug({ pretty: true }))
      .pipe(gulp.dest("dist"))
      .pipe(browserSync.stream());
});

// PUG COMPILATION TO HTML (PAGES)
gulp.task("pug-pages", function () {
   if (!fse.existsSync("./src/pages")) return Promise.resolve();
   return gulp
      .src("src/pages/**/*.pug", { allowEmpty: true })
      .pipe(plumber({
         errorHandler: notify.onError({
            title: "PUG Error",
            message: "<%= error.message %>"
         })
      }))
      .pipe(pug({ pretty: true }))
      .pipe(gulp.dest("dist/pages"))
      .pipe(browserSync.stream());
});

// COMBINED PUG TASKS
gulp.task("pug-all", gulp.parallel("pug-root", "pug-pages"));

// UPDATE JS
gulp.task("updateJS", async function () {
   await fse.remove("./dist/js");
   await fse.copy("./src/js", "./dist/js");
   return gulp.src("./dist/js/**/*.js").pipe(browserSync.stream());
});

// UPDATE IMAGES
gulp.task("updateIMAGES", async function () {
   await fse.remove("./dist/images");
   await fse.copy("./src/images", "./dist/images");
   return gulp.src("./dist/images/**").pipe(browserSync.stream());
});

// UPDATE HTML
gulp.task("updateHTML", async function () {
   await fse.remove("./dist/**/*.html");
   await fse.copy("./src", "./dist", {
      filter: (src) => src.endsWith(".html") || fse.statSync(src).isDirectory(),
   });
   return gulp.src("./dist/*.html").pipe(browserSync.stream());
});

// UPDATE CSS
gulp.task("updateCSS", function () {
   return gulp.src("./src/css/**/*.css")
      .pipe(changed("./dist/css"))
      .pipe(gulp.dest("./dist/css"))
      .pipe(browserSync.stream());
});

// LIVE SERVER
gulp.task("server", function () {
   
   browserSync.init({
      server: { baseDir: "./dist" },
      open: true,
      notify: false,
   });

   gulp.watch("./src/js/**/*.js", gulp.series("updateJS"));
   gulp.watch("./src/images/**", gulp.series("updateIMAGES"));
   gulp.watch("./src/**/*.html", gulp.series("updateHTML"));

   if (fse.existsSync("./src/css")) gulp.watch("./src/css/**/*.css", gulp.series("updateCSS"));
   if (fse.existsSync("./src/scss")) gulp.watch("./src/scss/**/*.scss", gulp.series("scss"));
   if (fse.existsSync("./src/pug")) gulp.watch("./src/pug/**/*.pug", gulp.series("pug-all"));
   if (checkFilesPresense('./src', '.pug')) gulp.watch("./src/*.pug", gulp.series("pug-root"));

   if (fse.existsSync("./src/pages")) {
      if (checkFilesPresense('./src/pages', '.pug')) gulp.watch("./src/pages/**/*.pug", gulp.series("pug-pages"));
   }

});

// DEFAULT
gulp.task("default",
   gulp.series("cleardist", "copyfiles", "scss", "pug-all", "server")
);


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// DELETE ORIGINALS HANDLER
async function removeOriginals(dir, ext, keepSuffix = '.min') {
   const entries = await fse.readdir(dir, { withFileTypes: true });
   for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
         await removeOriginals(fullPath, ext, keepSuffix);
      } else if (entry.isFile()) {
         if (entry.name.endsWith(ext) && !entry.name.endsWith(`${keepSuffix}${ext}`)) {
            await fse.remove(fullPath);
         }
      }
   }
}

// AUTOPREFIX AND MINIFY AND RENAME CSS
gulp.task('cssmin', function() {
   return gulp
      .src(['./dist/css/**/*.css', '!./dist/css/**/*.min.css'])
      .pipe(autoprefixer())
      .pipe(cssminify())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest('./dist/css/'));
});

// MINIFY AND RENAME JS
gulp.task('jsmin', function() {
   return gulp
      .src(['./dist/js/**/*.js', '!./dist/js/**/*.min.js'])
      .pipe(jsmin())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest('./dist/js/'));
});

// DELETE ORIGINALS
gulp.task('cleanOriginals', async function() {
   await removeOriginals('./dist/css', '.css');
   await removeOriginals('./dist/js', '.js');
});

// MINIFY HTML
gulp.task('htmlmin', function() {
   return gulp
      .src('./dist/**/*.html')
      .pipe(htmlminify({ collapseWhitespace: true, removeComments: true }))
      .pipe(gulp.dest('./dist/'));
});

// UPDATE REFS IN HTML FILES
gulp.task('updateHTMLRefs', function() {
   return gulp
      .src('./dist/**/*.html')
      .pipe(replace(
         /(<script[^>]+src=["'])([^"']+?)(?<!\.min)\.js(["'][^>]*>)/g,
         '$1$2.min.js$3'
      ))
      .pipe(replace(
         /(<link[^>]+href=["'])([^"']+?)(?<!\.min)\.css(["'][^>]*>)/g,
         '$1$2.min.css$3'
      ))
      .pipe(gulp.dest('./dist/'));
});

// UPDATE REFS IN JS FILES
gulp.task('updateJSRefs', function() {
   return gulp
      .src('./dist/js/**/*.js')
      .pipe(replace(
         /(['"`])(\.\/[^'"`]+?)(?<!\.min)\.js\1/g,
         '$1$2.min.js$1'
      ))
      .pipe(gulp.dest('./dist/js/'));
});

// UPDATE REFS IN CSS FILES
gulp.task('updateCSSRefs', function() {
   return gulp
      .src('./dist/css/**/*.css')
      .pipe(replace(
         /(['"`\(])(\.\/[^'"`\)]+?)(?<!\.min)\.css(['"`\)])/g,
         '$1$2.min.css$3'
      ))
      .pipe(gulp.dest('./dist/css/'));
});

// PRODUCTION
gulp.task('prod', gulp.series(
   gulp.parallel('cssmin', 'jsmin', 'htmlmin'),
   'cleanOriginals',
   gulp.parallel('updateHTMLRefs', 'updateJSRefs', 'updateCSSRefs')
));