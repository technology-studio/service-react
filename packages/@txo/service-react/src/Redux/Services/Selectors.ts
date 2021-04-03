/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date: 2021-03-27T15:03:12+01:00
 * @Copyright: Technology Studio
**/

import get from 'lodash.get'
import type {
  ServiceState,
  ContextServiceState,
} from '../../Redux/Services/ContextServiceRedux'

export const compositeContext = (...contexts: string[]): string => contexts.join('.')

export const GLOBAL_CONTEXT = 'global'

export const selectContextServiceState = <DATA>(
  state: ContextServiceState<DATA>,
  context: string,
): ServiceState<DATA> => get(state, context, { data: null, fetching: false, errorList: null })
