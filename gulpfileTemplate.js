require('core-js/stable')
require('regenerator-runtime/runtime')
const gulp = require('gulp')
const template = require('gulp-template')
const rename = require('gulp-rename')
const { PAGE_TYPES_DEFAULT_TITLE, PAGE_TYPES_GET_PAGE_ID } = require('./src/pageManager')


const isTest = process.env.NODE_ENV === 'testing'

const getLoadableTemplate = (libraryName, componentName) => {
  const compName = `'${libraryName}/${componentName}'`
  const compPath = `'./${libraryName}/${componentName}'`
  if (!isTest) {
    return `${compName}: Loadable({
      loader: () => import(${compPath}),
      loading: LoadingIndicator,
    })`
  }
  return `${compName}: require(${compPath}).default`
}

const getServicesTemplate = (libraryName, componentName, services) => {
  return `'${libraryName}/${componentName}': ${JSON.stringify(services)}`
}

const getModelTemplate = (libraryName, modelName, modelConfig, currentComponents, currentConstants) => {
  const componentTemplates = currentComponents.map(comp => `
    '${comp}': Loadable({
      loader: () => import('./${libraryName}/${modelName}/components/${comp}'),
      loading: LoadingIndicator,
    })
  `).join(',\n')
  return `'${libraryName}/${modelName}': {
    module: require('./${libraryName}/${modelName}').default,
    config: ${JSON.stringify(modelConfig)},
    components: {${componentTemplates}},
    constants: ${JSON.stringify(currentConstants)},
  }`
}

const getLayoutTemplate = (layoutName) => {
  return `'${layoutName}': {
    module: require('./${layoutName}/config').default,
  }`
}

const getComponentFormTemplate = (formName, path) => {
  return `'${formName}': require('${path}').default`
}

const getPageIntlMessage = (pageId, pageTitle) => {
  return `'${pageId}': {
    id: '${pageId}',
    defaultMessage: '${pageTitle}',
  }`
}

gulp.task('make-components', () => {
  const configsContext = require.context('./src/componentLibraries/', true, /config\.js(on)?$/)
  const formsContext = require.context('./src/componentLibraries/', true, /form\.js$/)

  const configs = configsContext.keys().reduce((memo, key) => ({
    ...memo,
    [key.replace(/\.?\/|config\.js(on)?/g, '')]: configsContext(key).default || configsContext(key),
  }), {})

  const forms = formsContext.keys().reduce((memo, key) => ({
    ...memo,
    [key.replace(/\.\/|\/form\.js/g, '')]: key.replace('.js', ''),
  }), {})

  return gulp.src('./src/componentLibraries/manifest.js.template')
      .pipe(template({
        components: Object.keys(configs).map(library => {
          const currentLibraryName = configs[library].title
          const currentComponents = configs[library].components
          return currentComponents.map(component => {
            return getLoadableTemplate(currentLibraryName, component.title)
          }).join(',\n')
        }).join(',\n'),
        forms: Object.keys(forms).map(formName => {
          return getComponentFormTemplate(formName, forms[formName])
        }).join(',\n'),
        services: Object.keys(configs).map(library => {
          const currentLibraryName = configs[library].title
          const currentComponents = configs[library].components
          return currentComponents.map(component => {
            return getServicesTemplate(currentLibraryName, component.title, component.services)
          }).join(',\n')
        }).join(',\n'),
      }))
      .pipe(rename(path => {
        path.basename = 'manifest'
        path.extname = '.js'
      }))
      .pipe(gulp.dest('./src/componentLibraries'))
})

gulp.task('make-business-objects', () => {
  const context = require.context('./src/businessObjects/', true, /config\.js(on)?$/)

  const configs = context.keys().reduce((memo, key) => ({
    ...memo,
    [key.replace(/\.?\/|config\.js(on)?/g, '')]: context(key).default || context(key),
  }), {})

  return gulp.src('./src/businessObjects/manifest.js.template')
      .pipe(template({
        models: Object.keys(configs).map(library => {
          const currentLibraryName = configs[library].title
          const currentModels = configs[library].models
          return currentModels.map(model => {
            const currentModule = require(`./src/businessObjects/${currentLibraryName}/${model.title}`)
            const currentComponents = Object.keys(currentModule.components || {})
            const currentConstants = currentModule.constants || {}
            return getModelTemplate(currentLibraryName, model.title, model, currentComponents, currentConstants)
          }).join(',\n')
        }).join(',\n'),
      }))
      .pipe(rename(path => {
        path.basename = 'manifest'
        path.extname = '.js'
      }))
      .pipe(gulp.dest('./src/businessObjects'))
})

gulp.task('make-layouts', () => {
  const context = require.context('./src/layouts/', true, /config\.js$/)

  const configs = context.keys().reduce((memo, key) => ({
    ...memo,
    [key.replace(/\.?\/|config\.js/g, '')]: context(key).default || context(key),
  }), {})

  return gulp.src('./src/layouts/manifest.js.template')
      .pipe(template({
        layouts: Object.keys(configs).map(layoutKey => {
          return getLayoutTemplate(layoutKey)
        }).join(',\n'),
      }))
      .pipe(rename(path => {
        path.basename = 'manifest'
        path.extname = '.js'
      }))
      .pipe(gulp.dest('./src/layouts'))
})

// TODO by @deylak import this from trood-core
const getPageId = (page, entityModelName) => PAGE_TYPES_GET_PAGE_ID[page.type](page, entityModelName)
const getPageTitle = (page) => page.title || PAGE_TYPES_DEFAULT_TITLE[page.type] || ''

gulp.task('make-locale', () => {
  const config = require('./src/config').default

  const reducePages = (modelType) => (memo, page) => {
    let currentPageTitles = [
      {
        id: getPageId(page, modelType),
        title: getPageTitle(page),
      },
    ]
    if (page.pages) {
      currentPageTitles = [
        ...currentPageTitles,
        ...page.pages.reduce(
          reducePages(page.modelType || modelType),
          [],
        ),
      ]
    }
    return memo.concat(currentPageTitles)
  }
  const flattenPages = config.pages.reduce(
    reducePages(),
    Object.keys(config.entityPages).reduce((memo, key) => {
      const currentPage = config.entityPages[key]
      let currentPageTitles = [
        {
          id: getPageId(currentPage, key),
          title: getPageTitle(currentPage),
        },
      ]
      if (currentPage.pages) {
        currentPageTitles = [
          ...currentPageTitles,
          ...currentPage.pages.reduce(
            reducePages(key),
            [],
          ),
        ]
      }
      return memo.concat(currentPageTitles)
    }, []),
  )
  return gulp.src('./src/configMessages.js.template')
      .pipe(template({
        pages: flattenPages
          .filter(page => page.title)
          .map(page => getPageIntlMessage(page.id, page.title))
          .join(',\n'),
      }))
      .pipe(rename(path => {
        path.basename = 'configMessages'
        path.extname = '.js'
      }))
      .pipe(gulp.dest('./src'))
})

gulp.task('default', gulp.parallel(
  'make-components',
  'make-business-objects',
  'make-layouts',
  'make-locale',
))
