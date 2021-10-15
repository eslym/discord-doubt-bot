const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const sourcemaps = require('gulp-sourcemaps');
const childProcess = require('child_process');
const path = require('path');
const packageJson = require("./package.json");

const proj = ts.createProject('./tsconfig.json');

gulp.task('build', function () {
    return proj.src()
        .pipe(sourcemaps.init())
        .pipe(proj())
        .js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
    return gulp.src(['dist'], {read: false, allowEmpty: true})
        .pipe(clean());
});

gulp.task('watch', function () {
    return gulp.watch(proj.config.include, gulp.task('build'));
});

gulp.task('docker', gulp.series([
    function cleanBuildFolder() {
        return gulp.src(['docker-build'], {read: false, allowEmpty: true})
            .pipe(clean());
    },
    function copyDist() {
        return gulp.src('dist/*')
            .pipe(gulp.dest('docker-build'));
    },
    function copyPackageJson() {
        return gulp.src('package.json')
            .pipe(gulp.dest('docker-build'));
    },
    function npmInstall() {
        return childProcess.execFile('npm', ['install', '--only=production'], {
            cwd: path.join(__dirname, 'docker-build')
        });
    },
    function dockerBuild() {
        return childProcess.execFile(
            'docker',
            [
                'build', '.',
                `--tag=eslym/discord-doubt-bot:${packageJson.version}`,
                '--tag=eslym/discord-doubt-bot:latest'
            ]
        );
    },
]));