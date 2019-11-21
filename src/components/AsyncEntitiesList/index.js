import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import style from './index.css'

import LoadMoreButton from '$trood/components/LoadMoreButton'
import LoadingIndicator from '$trood/components/LoadingIndicator'

import { LIST_TYPES } from './constants'
import { DEFAULT_SCROLLING_CONTAINER_ID } from '$trood/mainConstants'


const INFINITE_SCROLL_LOAD_HEIGHT_DELTA = 100

class AsyncEntitiesList extends PureComponent {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    contentClassName: PropTypes.string,

    nextPage: PropTypes.number,
    isLoading: PropTypes.bool,
    nextPageAction: PropTypes.func,
    reverse: PropTypes.bool,

    scrollContainer: PropTypes.oneOfType([
      PropTypes.string, // Css selector
      PropTypes.object, // DOM node
    ]),

    type: PropTypes.oneOf(Object.values(LIST_TYPES)),

    children: PropTypes.node,
  }

  static defaultProps = {
    type: LIST_TYPES.infiniteScroll,
    scrollContainer: `#${DEFAULT_SCROLLING_CONTAINER_ID}`,
  }

  constructor(props) {
    super(props)

    this.setScrollEvent = this.setScrollEvent.bind(this)
    this.handleScroll = this.handleScroll.bind(this)

    this.nextPageActionFired = false
    this.scrollContainerNode = null
  }

  componentDidMount() {
    this.setScrollEvent()
  }

  componentDidUpdate(prevProps) {
    this.setScrollEvent()
    if (this.props.nextPage !== prevProps.nextPage) {
      this.nextPageActionFired = false
    }
  }

  componentWillUnmount() {
    if (this.scrollContainerNode) {
      this.scrollContainerNode.removeEventListener('scroll', this.handleScroll)
    }
  }

  setScrollEvent() {
    const {
      type,
      scrollContainer,
    } = this.props
    if (type !== LIST_TYPES.infiniteScroll) return

    this.scrollContainerNode = scrollContainer
    if (typeof this.scrollContainerNode === 'string') {
      this.scrollContainerNode = document.querySelector(this.scrollContainerNode)
    }
    if (!this.scrollContainerNode) return
    this.scrollContainerNode.addEventListener('scroll', this.handleScroll)
    this.handleScroll()
  }

  handleScroll() {
    const scrollBottom = this.scrollContainerNode.scrollTop + this.scrollContainerNode.offsetHeight
    const scrollDelta = this.scrollContainerNode.scrollHeight - INFINITE_SCROLL_LOAD_HEIGHT_DELTA
    if (
      !this.nextPageActionFired &&
      scrollBottom > scrollDelta &&
      this.props.nextPage && !this.props.isLoading
    ) {
      this.nextPageActionFired = true
      this.props.nextPageAction()
    }
  }

  render() {
    const {
      id,
      className = '',
      contentClassName = '',

      nextPage,
      isLoading,
      nextPageAction,
      reverse,
      type,

      children,
    } = this.props
    const childrenArray = Array.isArray(children) ? children : [children]
    if (reverse) childrenArray.reverse()
    let content = [
      <div key="content" className={classNames(style.content, contentClassName)}>
        {childrenArray}
      </div>,
    ]

    if (type === LIST_TYPES.loadMoreButton) {
      content = content.concat((
        <LoadMoreButton {...{
          key: 'loadMore',
          className: nextPage || isLoading ? '' : style.hidden,
          onClick: () => {
            nextPageAction()
          },
          isLoading,
        }} />
      ))
    } else if (type === LIST_TYPES.infiniteScroll) {
      content = content.concat((
        <LoadingIndicator {...{
          key: 'loadMore',
          animationStop: !isLoading,
          className: isLoading ? '' : style.hidden,
        }} />
      ))
    }

    if (reverse) content.reverse()

    return (
      <div {...{
        id,
        className: classNames(style.root, className),
      }} >
        {content}
      </div>
    )
  }
}

export { LIST_TYPES } from './constants'

export default AsyncEntitiesList
