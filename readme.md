# gulp-jshint-bamboo

> Static Code Analysis Tool with [jshint](https://github.com/jshint-dev/node-jshint)

*Issues with the output should be reported on the jshint [issue tracker](https://github.com/jshint-dev/node-jshint/issues).*


## Install

```sh
$ npm install --save-dev gulp-jshint-bamboo
```


## Usage

```js
var gulp = require('gulp');
var jshintBamboo = require('gulp-jshint-bamboo');

gulp.task(
  'jshint',
  function() {
    return gulp.src([
      './dev/*.js',
      './dev/**/*.js',
      '!/dev/libs/**/*.js'
    ])
    .pipe(jshintBamboo())
  }
);
```

## Results

[mocha-bamboo-reporter](https://github.com/issacg/mocha-bamboo-reporter)

## License

CC BY 3.0