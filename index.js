#! /usr/bin/env node

var path    = require('path')
var fs      = require('fs')
var tablify = require('tablify').tablify

function parentDirs (dir, dirs) {
  dirs = dirs || []
  dirs.push(dir)
  //TODO: make this run on windows.
  if(dir == '/') return dirs
  return parentDirs(path.dirname(dir), dirs)
}

var exports = module.exports = function (dir, cb) {
  var n = 0, modules = {}
  var dirs = parentDirs(dir).map(function (e) {
    return path.join(e, 'node_modules')
  }).forEach(function (e) {
    n++;
    var m = 0
    fs.readdir(e, function (err, ls) {
      //--n;
      if(!err) {
        ls.map(function (f) {
          return path.join(e, f, 'package.json')
        })
        .forEach(function (e) {
          m++
          fs.readFile(e, 'utf-8', function (err, json) {
            if(err) return --m
            var pkg
            try {
              modules[e] = JSON.parse(json)
            } catch (err) {
              modules[e] = {name: path.basename(e), version: '?.?.?', error: err}
            }
            if(--m) return
            if(--n) return
            done()
          })
        })
      } else
        --n || done()
    })
  })

  function done() {
    var a = []
    Object.keys(modules).sort(function (a, b) {
      return a.split(path.sep).length - b.split(path.sep) || (
        a < b ? -1 : 1
      )
    }).map(function (k) {
      var pkg = modules[k]
      pkg.path = path.dirname(k)
      a.push(pkg)
    })
    cb(null, a)
  }

}

exports.parentDirs = parentDirs

if(!module.parent)
  exports(process.cwd(), function (err, pkgs) {
    console.log(
      (
        tablify(pkgs.map(function (p) {
          return {
            name    : p.name, 
            version : p.version,
            path    : path.relative(process.cwd(), p.path)
          }
        }), {
          row_start: ' ', row_end: ' ', spacer: '  ',
          keys: ['name', 'version', 'path'],
          row_sep_char: ' ',
          show_index: false,
          has_header: false
        })
      ).split(/---+/g).join('').split('\n').map(function(e) {
        return e.trim()
      }).join('\n').trim()
    )
  })

