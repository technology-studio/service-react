/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2017-07-03T16:01:56+02:00
 * @Copyright: Technology Studio
**/

import {
  call, put,
} from 'redux-saga/effects'
import type { ServiceCallResult } from '@txo/service-prop'
import {
  isServiceOperationError,
} from '@txo/service-prop'
import { Log } from '@txo/log'

import type { ContextServiceRedux } from '../Redux/Services/ContextServiceRedux'
import type {
  ContextServiceAction,
  ServiceOptions,
  SagaGenerator,
} from '../Model/Types'

import {
  type ProcessServiceOperationErrorResult,
  processServiceOperationErrorSaga,
} from './ProcessServiceOperationErrorSaga'

const log = new Log('txo.react-service.Sagas.ContextServiceSaga')

export function * contextServiceActionSaga<ATTRIBUTES extends Record<string, unknown>, DATA, SERVICE_ATTRIBUTES, CALL_DATA> (
  serviceCall: (attributes: ATTRIBUTES, serviceAttributes: SERVICE_ATTRIBUTES & { context: string }) => Promise<ServiceCallResult<DATA, CALL_DATA>> | SagaGenerator<ServiceCallResult<DATA, CALL_DATA>>,
  action: ContextServiceAction<ATTRIBUTES, DATA, CALL_DATA>,
  redux: ContextServiceRedux<ATTRIBUTES, DATA>,
  serviceAttributes: SERVICE_ATTRIBUTES,
  serviceOptions?: ServiceOptions,
): SagaGenerator<ServiceCallResult<DATA, CALL_DATA> | null | undefined> {
  const { context, attributes, promiseHandlers } = action
  while (true) {
    try {
      log.debug('CALL', { action, serviceAttributes, serviceOptions })
      const serviceCallResult = (yield call(serviceCall, attributes, {
        ...serviceAttributes,
        context: action.context,
      })) as ServiceCallResult<DATA, CALL_DATA>
      const { data } = serviceCallResult
      yield put(redux.creators.serviceSuccess({ data }, { context }))
      if (promiseHandlers != null) {
        yield call(promiseHandlers.resolve, serviceCallResult)
      }
      return serviceCallResult
    } catch (errorOrServiceOperationError) {
      log.debug('EXCEPTION')
      if (isServiceOperationError(errorOrServiceOperationError)) {
        const result = (yield call(processServiceOperationErrorSaga, { serviceOperationError: errorOrServiceOperationError })) as ProcessServiceOperationErrorResult | undefined
        if (result?.retryCall ?? false) {
          continue
        }
        yield put(redux.creators.serviceFailure({ error: errorOrServiceOperationError }, { context }))
        if (promiseHandlers != null) {
          yield call(promiseHandlers.reject, errorOrServiceOperationError)
        }
        return
      } else {
        throw errorOrServiceOperationError
      }
    }
  }
}
