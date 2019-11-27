'use strict'
const path = require('path')
const paths = require('../config/paths')
var fs = require('fs')
const webpack = require('webpack')


const nodeModules = {}
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod
  })

webpack({
  mode: 'production',
  externals: nodeModules,
  entry: './gulpfileTemplate.js',
  target: 'node',
  output: {
    path: path.join(__dirname, '../'),
    filename: 'gulpfile.js',
  },
  resolve: {
    modules: ['./node_modules'],
    alias: {
      '$trood/componentLibraries/manifest': paths.appSrc + '/config.js',
      '$trood/businessObjects/manifest': paths.appSrc + '/config.js',
      '$trood/layouts/manifest': path.join(__dirname, '../scripts/defaultLayoutsManifest.js'),
      '$trood/configMessages': path.join(__dirname, '../scripts/defaultConfigMessages.js'),
      $trood: paths.appSrc,
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: 'null-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules|manifest\.js|configMessages\.js/,
        loader: require.resolve('babel-loader'),
        options: {
          cacheDirectory: true,
        },
      },
    ],
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
}, (err, stats) => {
  if (err || stats.hasErrors()) {
    // Handle errors here
    console.log(err, stats)
  }
  // Done processing
})
