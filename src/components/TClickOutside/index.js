// TODO by @deylak rethink, how this component works, maybe add container element for it
// Or use HOC, maybe https://github.com/kentor/react-click-outside
/* eslint-disable react/no-find-dom-node */
import PropTypes from 'prop-types'
import { PureComponent } from 'react'
import { findDOMNode } from 'react-dom'

import { bind, unbind } from '$trood/helpers/events'

const clickEvents = ['click', 'touchend']

/**
 * Component wrapper, gives onClick event.
 */

class TClickOutside extends PureComponent {
  static propTypes = {
    /** onClick function */
    onClick: PropTypes.func,
    /** children node */
    children: PropTypes.node,
  }

  static defaultProps = {
    onClick: () => {},
  }

  constructor(props) {
    super(props)
    this.handleOutsideClick = this.handleOutsideClick.bind(this)
  }

  componentDidMount() {
    bind(clickEvents, this.handleOutsideClick)
  }

  componentWillUnmount() {
    unbind(clickEvents, this.handleOutsideClick)
  }

  handleOutsideClick(e) {
    const path = e.path || e.composedPath()
    if (!path.includes(findDOMNode(this))) {
      this.props.onClick()
    }
  }

  render() {
    return this.props.children
  }
}

export default TClickOutside
