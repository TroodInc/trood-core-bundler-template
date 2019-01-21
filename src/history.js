import createHistory from 'history/createBrowserHistory'
import { stringify, parse } from 'qs'
import qhistory from 'qhistory'

const history = qhistory(
  createHistory(),
  stringify,
  parse,
)

export default history
