const paths = require('./config/paths');


module.exports = {
  pagePerSection: true,
  usageMode: 'expand',
  styleguideDir: 'docs/styleguide',
  webpackConfig: {
    resolve: {
      alias: {
        $trood: paths.appSrc,
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|mjs)$/,
          loader: require.resolve('babel-loader'),
          options: {
            cacheDirectory: true,
          },
        },
        {
          test: /\.css$/,
          use: [
            require.resolve('style-loader'),
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1,
                sourceMap: true,
                modules: {
                  localIdentName: '[name]__[local]___[hash:base64:5]',
                },
              },
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                ident: 'postcss',
                plugins: () => [
                  require('postcss-global-import')({
                    path: ['src'],
                  }),
                  require('postcss-import')({
                    path: ['src'],
                  }),
                  require('postcss-flexbugs-fixes'),
                  require('postcss-preset-env')({
                    preserve: false,
                    features: {
                      'custom-media-queries': true,
                      'color-mod-function': true,
                    },
                    importFrom: 'src/styles/variables.css',
                    browsers: [
                      '>1%',
                      'last 4 versions',
                      'Firefox ESR',
                      'not ie < 9', // React doesn't support IE8 anyway
                    ],
                    flexbox: 'no-2009',
                  }),
                ],
              },
            },
          ],
        },
      ],
    },
  },
  components: 'src/components/*/index.js'
}