/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2017-07-03T16:01:56+02:00
 * @Copyright: Technology Studio
**/

import {
  call, put,
} from 'redux-saga/effects'
import {
  isServiceErrorException,
  ServiceCallResult,
} from '@txo/service-prop'
import { Log } from '@txo/log'

import type { ContextServiceRedux } from '../Redux/Services/ContextServiceRedux'
import type {
  ContextServiceAction,
  ServiceOptions,
  SagaGenerator,
} from '../Model/Types'

import { processServiceErrorSaga } from './ProcessServiceErrorSaga'

const log = new Log('txo.react-service.Sagas.ContextServiceSaga')

export function * contextServiceActionSaga<ATTRIBUTES extends Record<string, unknown>, DATA, SERVICE_ATTRIBUTES, CALL_DATA> (
  serviceCall: (attributes: ATTRIBUTES, serviceAttributes: SERVICE_ATTRIBUTES) => Promise<ServiceCallResult<DATA, CALL_DATA>> | SagaGenerator<ServiceCallResult<DATA, CALL_DATA>>,
  action: ContextServiceAction<ATTRIBUTES, DATA, CALL_DATA>,
  redux: ContextServiceRedux<ATTRIBUTES, DATA, CALL_DATA>,
  serviceAttributes: SERVICE_ATTRIBUTES,
  serviceOptions?: ServiceOptions,
): SagaGenerator<ServiceCallResult<DATA, CALL_DATA> | null | undefined> {
  const { context, attributes, promiseHandlers } = action
  while (true) {
    try {
      log.debug('CALL', { action, serviceAttributes, serviceOptions })
      const serviceCallResult: ServiceCallResult<DATA, CALL_DATA> = yield call(serviceCall, attributes, serviceAttributes)
      const { data } = serviceCallResult
      yield put(redux.creators.serviceSuccess({ data }, { context }))
      if (promiseHandlers) {
        yield call(promiseHandlers.resolve, serviceCallResult)
      }
      return serviceCallResult
    } catch (errorOrServiceErrorException) {
      log.debug('EXCEPTION')
      if (isServiceErrorException(errorOrServiceErrorException)) {
        errorOrServiceErrorException.context = context

        const result = yield call(processServiceErrorSaga, { serviceErrorList: errorOrServiceErrorException.serviceErrorList })
        if (result?.retryCall) {
          continue
        }
        yield put(redux.creators.serviceFailure({ exception: errorOrServiceErrorException }, { context }))
        if (promiseHandlers) {
          yield call(promiseHandlers.reject, errorOrServiceErrorException)
        }
        return
      } else {
        throw errorOrServiceErrorException
      }
    }
  }
}
