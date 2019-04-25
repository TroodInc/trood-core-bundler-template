import { PureComponent } from 'react'
import { injectIntl } from 'react-intl'

import {
  intlRenderCallback,
} from '../../constants'


class IntlInjector extends PureComponent {
  static propTypes = {
  }

  static defaultProps = {
  }

  render() {
    const {
      intl,
    } = this.props

    intlRenderCallback(intl)
    return null
  }
}

export default injectIntl(IntlInjector)
