'use strict'

const webpackMainConfig = require('./webpack.main.config')
const webpackCraftConfig = require('./webpack.craft.config')

const { env } = require('./webpack.global')


const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false'

module.exports = function (webpackEnv) {
  const isDevelopment = webpackEnv === 'development'
  const isProduction = webpackEnv === 'production'
  const shouldUseProductionProfile = isProduction && process.argv.includes('--profile')
  const shouldUseReactRefresh = env.raw.FAST_REFRESH

  const webpackConfigOptions = {
    isDevelopment,
    isProduction,
    shouldUseProductionProfile,
    shouldUseReactRefresh,
    shouldUseSourceMap,
  }

  return [
    webpackCraftConfig(webpackConfigOptions),
    webpackMainConfig(webpackConfigOptions),
  ].filter(Boolean)
}
