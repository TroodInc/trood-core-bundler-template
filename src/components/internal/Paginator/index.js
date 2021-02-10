import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import { Observer } from 'mobx-react-lite'
import classNames from 'classnames'
import debounce from 'lodash/debounce'

import BaseComponent from 'core/BaseComponent'
import { Component } from 'core/pageStore'
import Context from '../../Context'

import Select from '../../Select'
import LoadingIndicator from '../../LoadingIndicator'

import styles from './index.module.css'


class Paginator extends PureComponent {
  static defaultProps = {
    defaultPageSize: 10,
    pagesControlsCount: 5,
    type: 'classic',
    pageSizes: [10, 25, 50, 100],
  }

  constructor(props) {
    super(props)

    this.scrollContainerNode = null
    this.mount = false

    this.setScrollEvent = this.setScrollEvent.bind(this)
    this.handleScroll = debounce(this.handleScroll.bind(this), 200)
    this.goToPage = this.goToPage.bind(this)
    this.renderClassicControls = this.renderClassicControls.bind(this)
    this.renderInfinityControls = this.renderInfinityControls.bind(this)
  }

  componentDidMount() {
    this.mount = true
    this.setScrollEvent()
  }

  componentWillUnmount() {
    if (this.scrollContainerNode) {
      this.scrollContainerNode.removeEventListener('scroll', this.handleScroll)
    }
  }

  setScrollEvent() {
    const { type, scrollContainerSelector } = this.props
    if (type !=='infinity') return

    this.scrollContainerNode = document.querySelector(scrollContainerSelector)
    if (!this.scrollContainerNode) return
    this.scrollContainerNode.addEventListener('scroll', this.handleScroll)
    this.handleScroll()
  }

  handleScroll() {
    if (this.scrollContainerNode) {
      const { entity, queryOptions } = this.props
      const { pageSize } = this.paginator
      const scrollBottom = this.scrollContainerNode.scrollTop + this.scrollContainerNode.offsetHeight
      const scrollDelta = this.scrollContainerNode.scrollHeight - 100
      const loading = entity.getInfinityPagesLoading(pageSize, queryOptions)
      const nextPage = entity.getInfinityNextPageNumber(pageSize, queryOptions)
      if (nextPage && !loading && scrollBottom > scrollDelta) {
        entity.getInfinityNextPage(pageSize, queryOptions)
      }
    }
  }

  get paginator() {
    const {
      type,
      history,
      defaultPageSize,
    } = this.props

    if (type === 'disabled') {
      return { page: 0, pageSize: 0 }
    }

    const searchParams = new URLSearchParams(history.location.search)
    const page = searchParams.get('page')
    const pageSize = searchParams.get('pageSize')

    return {
      page: page ? +page : 0,
      pageSize: pageSize ? +pageSize : defaultPageSize,
    }
  }

  renderClassicControls(bottom) {
    const {
      type,
      entity,
      queryOptions,
      pagesControlsCount,
      pageSizes,
      topControls,
      bottomControls,
    } = this.props

    if (
      type !== 'classic' ||
      (topControls === false && !bottom) ||
      (bottomControls === false && bottom)
    ) return null

    const { page, pageSize } = this.paginator

    const pagesCount = entity.getPagesCount(pageSize, queryOptions)

    const pages = Array(Math.min(pagesControlsCount, pagesCount))
      .fill(page)
      .map((item, i, arr) => item + i - Math.floor(arr.length / 2))
      .filter(item => item >= 0 && item < (pagesCount - 1))
    while (pages.length < pagesControlsCount && pages[pages.length - 1] < (pagesCount - 1)) {
      pages.push(pages[pages.length - 1] + 1)
    }
    while (pages.length < pagesControlsCount && pages[0] > 0) {
      pages.unshift(pages[0] - 1)
    }

    if ((topControls && !bottom) || (bottomControls && bottom)) {
      const controlsStore = Component.create({ nodes: (bottom ? bottomControls : topControls) })
      return (
        <Context context={{
          pagesCount,
          pageSize,
          currentPage: page,
          goToPage: this.goToPage,
        }}>
          <BaseComponent component={controlsStore} />
        </Context>
      )
    }

    return (
      <div className={styles.classicControls}>
        <div className={styles.pages}>
          {pages[0] > 0 && (
            <div
              className={styles.page}
              onClick={() => this.goToPage(0, pageSize)}
            >
              1
            </div>
          )}
          {pages[0] > 1 && (
            <div className={styles.pageSplitter}>...</div>
          )}
          {pages.map(item => (
            <div
              key={item}
              className={classNames(styles.page, item === page && styles.activePage)}
              onClick={() => this.goToPage(item, pageSize)}
            >
              {item + 1}
            </div>
          ))}
          {pages[pages.length - 1] < pagesCount - 2 && (
            <div className={styles.pageSplitter}>...</div>
          )}
          {pages[pages.length - 1] < pagesCount - 1 && (
            <div
              className={styles.page}
              onClick={() => this.goToPage(pagesCount - 1, pageSize)}
            >
              {pagesCount}
            </div>
          )}
        </div>
        <Select {...{
          className: styles.select,
          controlClassName: styles.selectControl,
          labelClassName: styles.selectLabel,
          label: 'per page',
          items: pageSizes.map(value => ({ value, label: value })),
          values: [pageSize],
          openUp: bottom,
          onChange: values => this.goToPage(0, values[0]),
        }} />
      </div>
    )
  }

  renderInfinityControls() {
    const {
      entity,
      queryOptions,
      type,
      infinityControls,
    } = this.props

    const { pageSize } = this.paginator

    if (type !== 'infinity' || infinityControls === false || !this.mount || this.scrollContainerNode) return null

    const nextPage = entity.getInfinityNextPageNumber(pageSize, queryOptions)

    if (nextPage === undefined) return null

    if (infinityControls) {
      const controlsStore = Component.create({ nodes: infinityControls })
      return (
        <Context context={{
          loadNextPage: () => entity.getInfinityNextPage(pageSize, queryOptions),
        }}>
          <BaseComponent component={controlsStore} />
        </Context>
      )
    }

    return (
      <div className={styles.loadMore} onClick={() => entity.getInfinityNextPage(pageSize, queryOptions)}>
        Load More...
      </div>
    )
  }

  goToPage(p, ps) {
    const { history } = this.props

    const page = p === undefined ? this.paginator.page : p
    const pageSize = ps === undefined ? this.paginator.pageSize : ps

    const searchParams = new URLSearchParams(history.location.search)

    searchParams.set('page', page.toString())
    searchParams.set('pageSize', pageSize.toString())
    history.replace({
      ...history.location,
      search: searchParams.toString(),
    })
  }

  render() {
    const {
      className,
      type,
      entity,
      queryOptions,
      children,
    } = this.props

    const { page, pageSize } = this.paginator

    return (
      <Observer>
        {() => {
          let items = []
          let loading = false
          if (type === 'infinity') {
            items = entity.getInfinityPages(pageSize, queryOptions)
            loading = entity.getInfinityPagesLoading(pageSize, queryOptions)
            this.handleScroll()
          } else {
            items = entity.getPage(page, pageSize, queryOptions)
            loading = entity.getPageLoading(page, pageSize, queryOptions)
          }

          return (
            <div className={classNames(styles.root, className)}>
              {this.renderClassicControls()}
              {children({ items })}
              {loading && (
                <LoadingIndicator />
              )}
              {this.renderClassicControls(true)}
              {this.renderInfinityControls()}
            </div>
          )
        }}
      </Observer>
    )
  }
}

export default withRouter(Paginator)
