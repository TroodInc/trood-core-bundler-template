import { RestifyForeignKey } from 'redux-restify'

import { JOURNAL_API_NAME, HISTORY_ENDPOINT } from '$trood/journalApiUrlSchema'


export default {
  apiName: JOURNAL_API_NAME,
  endpoint: HISTORY_ENDPOINT,
  defaults: {
    id: undefined,
    actor: {
      id: undefined,
      login: undefined,
      role: undefined,
      status: undefined,
      linkedObject: undefined,
    },
    action: undefined,
    v: undefined,
    ts: undefined,
    diff: undefined,
    revision: undefined,
    journal: new RestifyForeignKey('journals'),
  },
  warnAboutUnregisteredFields: false,
}
