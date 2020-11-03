require('core-js/stable')
require('regenerator-runtime/runtime')
const gulp = require('gulp')
const template = require('gulp-template')
const rename = require('gulp-rename')
const pluralize = require('pluralize')
const { getPageConfig } = require('./src/pageManager')
const {camelToUpperHuman} = require('./src/helpers/namingNotation')


const isTest = process.env.NODE_ENV === 'testing'

const getLoadableTemplate = (libraryName, componentName) => {
  const compName = `'${libraryName}/${componentName}'`
  const compPath = `'./${libraryName}/${componentName}'`
  if (!isTest) {
    return `${compName}: loadable(
      () => import(${compPath}),
      {
        fallback: (<LoadingIndicator />),
      },
    )`
  }
  return `${compName}: require(${compPath}).default`
}

const getServicesTemplate = (libraryName, componentName, services) => {
  return `'${libraryName}/${componentName}': ${JSON.stringify(services)}`
}

const getModelTemplate = (libraryName, modelName, modelConfig, currentComponents, currentConstants) => {
  const componentTemplates = currentComponents.map(comp => `
    '${comp}': loadable(
      () => import('./${libraryName}/${modelName}/components/${comp}'),
      {
        fallback: (<LoadingIndicator />),
      },
    )
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

const getComponentFormTemplate = ({ id, config }) => {
  return `'${id}': require('${config}').default`
}

const getIntlMessage = (id, message) => {
  return `'${id}': {
    id: '${id}',
    defaultMessage: '${message}',
  }`
}

gulp.task('make-components', () => {
  const config = require('./src/config').default
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

  const pages = [
    ...config.pages.map(p => getPageConfig(p)),
    ...Object.keys(config.entityPages).map(key => getPageConfig(config.entityPages[key], key)),
  ]
  const componentsForms = []
  const forEachComponents = (comps = []) => {
    comps.forEach(c => {
      const compFormConfig = forms[c.type]
      if (compFormConfig) {
        componentsForms.push({
          id: c.id,
          type: c.type,
          config: compFormConfig,
        })
      }
      if (c.components) forEachComponents(c.components)
    })
  }
  const forEachPages = (pgs = []) => {
    pgs.forEach(p => {
      if (p.components) forEachComponents(p.components)
      if (p.pages) forEachPages(p.pages)
    })
  }
  forEachPages(pages)

  return gulp.src('./src/componentLibraries/manifest.js.template')
    .pipe(template({
      components: Object.keys(configs).map(library => {
        const currentLibraryName = configs[library].title
        const currentComponents = configs[library].components
        return currentComponents.map(component => {
          return getLoadableTemplate(currentLibraryName, component.title)
        }).join(',\n    ')
      }).join(',\n    '),
      forms: componentsForms.map(getComponentFormTemplate).join(',\n    '),
      services: Object.keys(configs).map(library => {
        const currentLibraryName = configs[library].title
        const currentComponents = configs[library].components
        return currentComponents.map(component => {
          return getServicesTemplate(currentLibraryName, component.title, component.services)
        }).join(',\n    ')
      }).join(',\n    '),
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

gulp.task('make-locale', () => {
  const config = require('./src/config').default

  const pages = [
    ...config.pages.map(p => getPageConfig(p)),
    ...Object.keys(config.entityPages).map(key => getPageConfig(config.entityPages[key], key)),
  ]

  const reducePages = (memo, page) => {
    return [
      ...memo,
      page,
      ...(page.pages && page.pages.length ? page.pages.reduce(reducePages, []) : []),
    ]
  }
  const allPages = pages.reduce(reducePages, [])

  const reduceComponents = (memo, comp) => {
    return [
      ...memo,
      ...(comp.components || []),
      ...(comp.components && comp.components.length ? comp.components.reduce(reduceComponents, []) : []),
    ]
  }
  const allComps = allPages.reduce(reduceComponents, [])

  return gulp.src('./src/configMessages.js.template')
    .pipe(template({
      pages: allPages.concat(allComps)
        .filter(item => item.title)
        .map(item => getIntlMessage(item.id, item.title))
        .join(',\n'),
    }))
    .pipe(rename(path => {
      path.basename = 'configMessages'
      path.extname = '.js'
    }))
    .pipe(gulp.dest('./src'))
})

gulp.task('make-bo-locale', () => {
  const context = require.context('./src/businessObjects/', true, /model\.js(on)?$/)
  const getFieldDefines = (defaults, entityName) => Object.keys(defaults).reduce((memo, fieldName) => {
    return [
      ...memo,
      `    ${fieldName}: {
      id: 'entityMessages.${entityName}.${fieldName}',
      defaultMessage: '${camelToUpperHuman(fieldName)}',
    }`,
    ]
  }, []).join(',\n')

  const models = context
    .keys()
    .reduce((libraries, key) => {
      const entityName = key.split('/')[2]
      return [
        ...libraries,
        `  ${entityName}: defineMessages({
    _object: {
      id: 'entityMessages.${entityName}',
      defaultMessage: '${pluralize.singular(camelToUpperHuman(entityName))}',
    },
    _objects: {
      id: 'entityMessages.${entityName}._objects',
      defaultMessage: '${pluralize.plural(camelToUpperHuman(entityName))}',
    },
    _objectView: {
      id: 'entityMessages.${entityName}._objectView',
      defaultMessage: '${camelToUpperHuman(entityName)}',
    },
${getFieldDefines(context(key).default.defaults, entityName)}
  }),\n`
      ]
    }, [])
    .join('')

  return gulp
    .src('./src/businessObjects/entityMessages.js.template')
    .pipe(template({ models }))
    .pipe(
      rename((path) => {
        path.basename = 'entityMessages'
        path.extname = '.js'
      }),
    )
    .pipe(gulp.dest('./src/businessObjects'))
})

gulp.task(
  'default',
  gulp.series(
    gulp.parallel(
      'make-locale',
      'make-bo-locale',
    ),
    gulp.parallel(
      'make-components',
      'make-business-objects',
      'make-layouts',
    ),
  ),
)