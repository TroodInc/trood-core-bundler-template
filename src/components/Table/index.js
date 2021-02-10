import React from 'react'
import BaseComponent from 'core/BaseComponent'
import { Component } from 'core/pageStore'
import Context from '../Context'

import Paginator from '../internal/Paginator'

import styles from './index.module.css'
import PropTypes from 'prop-types'


const getComponents = (columnComponents, componentKey = 'bodyCell', wrapper = 'td') =>
  columnComponents.map(c => {
    let component = c[componentKey]
    if (!component || component.type !== wrapper) {
      component = {
        type: wrapper,
        nodes: [c[componentKey]],
      }
    }
    return component
  })

const Table = ({
  className,
  entity,
  queryOptions,
  columnComponents,
  pagination = {},
}) => {
  const headerComponents = getComponents(columnComponents, 'headerCell', 'th')
  const bodyComponents = getComponents(columnComponents)
  const headerComponentsStore = Component.create({ nodes: headerComponents })
  const bodyComponentsStore = Component.create({ nodes: bodyComponents })

  return (
    <Paginator {...pagination} className={className} entity={entity} queryOptions={queryOptions}>
      {({ items }) => (
        <table className={styles.table}>
          <thead>
            <tr>
              <BaseComponent component={headerComponentsStore} />
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <Context key={i} context={item}>
                <tr>
                  <BaseComponent component={bodyComponentsStore} />
                </tr>
              </Context>
            ))}
          </tbody>
        </table>
      )}
    </Paginator>
  )
}

Table.propTypes = {
  className: PropTypes.string,
  entity: PropTypes.shape({
    getPage: PropTypes.func,
    getPageLoading: PropTypes.func,
    getPagesCount: PropTypes.func,
    getInfinityPages: PropTypes.func,
    getInfinityPagesLoading: PropTypes.func,
    getInfinityNextPage: PropTypes.func,
    getInfinityNextPageNumber: PropTypes.func,
  }).isRequired,
  queryOptions: PropTypes.shape({
    headers: PropTypes.object,
    hash: PropTypes.string,
    cacheMaxAgeMs: PropTypes.number,
    filters: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
  columnComponents: PropTypes.arrayOf(PropTypes.shape({
    headerCell: PropTypes.object,
    bodyCell: PropTypes.object,
  })),
  pagination: PropTypes.shape({
    type: PropTypes.oneOf(['classic', 'infinity', 'disabled']),
    defaultPageSize: PropTypes.number,
    pagesControlsCount: PropTypes.number,
    pageSizes: PropTypes.arrayOf(PropTypes.number),
    scrollContainerSelector: PropTypes.string,
    topControls: PropTypes.oneOfType([PropTypes.bool, PropTypes.arrayOf(PropTypes.object)]),
    bottomControls: PropTypes.oneOfType([PropTypes.bool, PropTypes.arrayOf(PropTypes.object)]),
    infinityControls: PropTypes.oneOfType([PropTypes.bool, PropTypes.arrayOf(PropTypes.object)]),
  }),
}

export default Table
