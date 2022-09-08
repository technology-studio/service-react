/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2017-07-03T16:01:56+02:00
 * @Copyright: Technology Studio
**/

import { call } from 'redux-saga/effects'

import type {
  ServiceAction,
  SagaGenerator,
} from '../Model/Types'

export function * asyncServiceActionSaga<
  ATTRIBUTES extends Record<string, unknown> | undefined,
  DATA,
  SERVICE_ATTRIBUTES,
  CALL_DATA,
> (
  serviceCall: (attributes: ATTRIBUTES, serviceAttributes: SERVICE_ATTRIBUTES) => Promise<void> | SagaGenerator,
  action: ServiceAction<ATTRIBUTES, DATA, CALL_DATA>,
  serviceAttributes: SERVICE_ATTRIBUTES,
): SagaGenerator {
  yield call(serviceCall, action.attributes, serviceAttributes)
}
