/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2017-07-03T16:01:56+02:00
 * @Copyright: Technology Studio
**/

import {
  call, put,
} from 'redux-saga/effects'
import {
  ServiceError, isServiceErrorException,
} from '@txo/service-prop'
import { Log } from '@txo/log'

import type { ContextServiceRedux } from '../Redux/Services/ContextServiceRedux'
import type {
  ContextServiceAction,
  ServiceOptions,
  SagaGenerator,
  ServiceCallResult,
} from '../Model/Types'

import { processServiceErrorSaga } from './ProcessServiceErrorSaga'

const log = new Log('txo.react-service.Sagas.ContextServiceSaga')

export function * contextServiceActionSaga<ATTRIBUTES extends Record<string, unknown>, DATA, SERVICE_ATTRIBUTES, CALL_DATA> (
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  serviceCall: (attributes: ATTRIBUTES, serviceAttributes: SERVICE_ATTRIBUTES) => Promise<DATA> | SagaGenerator<DATA extends undefined ? void : DATA>,
  action: ContextServiceAction<ATTRIBUTES, DATA, CALL_DATA>,
  redux: ContextServiceRedux<ATTRIBUTES, DATA, CALL_DATA>,
  serviceAttributes: SERVICE_ATTRIBUTES,
  serviceOptions?: ServiceOptions,
): SagaGenerator<DATA | null | undefined> {
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
      return data
    } catch (errorOrServiceErrorList) {
      log.debug('EXCEPTION')
      if (isServiceErrorException(errorOrServiceErrorList)) {
        const serviceErrorList: ServiceError[] = errorOrServiceErrorList.serviceErrorList.map(
          serviceError => ({
            context,
            ...serviceError,
          }),
        )

        const result = yield call(processServiceErrorSaga, { serviceErrorList })
        if (result?.retryCall) {
          continue
        }
        yield put(redux.creators.serviceFailure({ errorList: serviceErrorList }, { context }))
        if (promiseHandlers) {
          yield call(promiseHandlers.reject, serviceErrorList)
        }
        return
      } else {
        throw errorOrServiceErrorList
      }
    }
  }
}
