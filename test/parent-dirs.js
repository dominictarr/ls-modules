var tape = require('tape')

var nm = require('../')

tape('test', function (t) {

  console.log(nm.parentDirs(__dirname))

  nm(__dirname, console.log)

})
