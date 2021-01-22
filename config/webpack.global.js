'use strict'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const paths = require('./paths')
const postcssNormalize = require('postcss-normalize')
const getClientEnvironment = require('./env')


const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1))

const cssRegex = /\.css$/
const cssModuleRegex = /\.module\.css$/
const sassRegex = /\.(scss|sass)$/
const sassModuleRegex = /\.module\.(scss|sass)$/

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false'

const getBabelLoader = ({
  hasJsxRuntime = false,
  useReactRefresh = false,
  compact = false,
}) => ({
  test: /\.(js|mjs|jsx|ts|tsx)$/,
  include: paths.appSrc,
  loader: require.resolve('babel-loader'),
  options: {
    customize: require.resolve(
      'babel-preset-react-app/webpack-overrides',
    ),
    presets: [
      [
        require.resolve('babel-preset-react-app'),
        {
          runtime: hasJsxRuntime ? 'automatic' : 'classic',
        },
      ],
    ],
    plugins: [
      [
        require.resolve('babel-plugin-named-asset-import'),
        {
          loaderMap: {
            svg: {
              ReactComponent:
                '@svgr/webpack?-svgo,+titleProp,+ref![path]',
            },
          },
        },
      ],
      useReactRefresh && require.resolve('react-refresh/babel'),
    ].filter(Boolean),
    cacheDirectory: true,
    cacheCompression: false,
    compact,
  },
})

const getStyleLoaders = ({
  isCssInJs = false,
  isDevelopment = false,
  isProduction = false,
  options = {},
  preProcessor,
}) => {
  return [
    (isDevelopment || isCssInJs) && require.resolve('style-loader'),
    (isProduction && !isCssInJs) && {
      loader: MiniCssExtractPlugin.loader,
      options: paths.publicUrlOrPath.startsWith('.') ? { publicPath: '../../' } : {},
    },
    {
      loader: require.resolve('css-loader'),
      options,
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          require('postcss-preset-env')({
            stage: 3,
            autoprefixer: {
              flexbox: 'no-2009',
            },
            flexbox: 'no-2009',
            preserve: !isCssInJs,
            importFrom: isCssInJs ? ['src/styles/variables.css'] : [],
          }),
          postcssNormalize(),
        ],
        sourceMap: isProduction ? shouldUseSourceMap : isDevelopment,
      },
    },
    preProcessor && {
      loader: require.resolve('resolve-url-loader'),
      options: {
        sourceMap: isProduction ? shouldUseSourceMap : isDevelopment,
        root: paths.appSrc,
      },
    },
    preProcessor && {
      loader: require.resolve(preProcessor),
      options: {
        sourceMap: true,
      },
    },
  ].filter(Boolean)
}

module.exports = {
  env,
  cssRegex,
  cssModuleRegex,
  sassRegex,
  sassModuleRegex,
  getBabelLoader,
  getStyleLoaders,
}
