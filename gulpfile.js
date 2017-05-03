"use strict";

const fs = require("fs");
const gulp = require("gulp");
const tslint = require("gulp-tslint");
const typescript = require("gulp-typescript");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");

const tsProject = typescript.createProject("tsconfig.json", {
    typescript: require("typescript")
});

gulp.task("tslint", () => {
    return gulp
        .src(["src/**/*.ts"])
        .pipe(tslint())
        .pipe(tslint.report({
            summarizeFailureOutput: true
        }));
});

gulp.task("clean", ["tslint"], () => {
    del.sync(["lib"]);
});

gulp.task("build-js", ["clean"], () => {
    return gulp
        .src(["src/**/*.ts"])
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .js
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("lib"));
});

gulp.task("build-dts", ["build-js"], () => {
    return gulp
        .src(["src/**/*.ts"])
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .dts
        .pipe(gulp.dest("lib"));
});

gulp.task("build", ["build-dts"])

gulp.task("test", test)

gulp.task("watch", () => {
    gulp.watch(["src/**/*.ts", "tslint.json"], ["build-dts"]);
    gulp.watch("test/**/*.js", ["test"]);
});

gulp.task("default", ["build"], test);

function test() {
    // TODO
    console.warn("test: Not Implemented.");
}