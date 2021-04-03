/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2019-01-14T20:41:08+01:00
 * @Copyright: Technology Studio
**/

import {
  put, race, take, delay,
} from 'redux-saga/effects'
import type { ServiceError } from '@txo/service-prop'
import { Log } from '@txo/log'
// @ts-expect-error TODO: add typescript type declaration
import { CODE_NETWORK_CONNECTION_ERROR } from '@txo/react-service-error-handler'
// @ts-expect-error TODO: add typescript type declaration
import { offlineRedux } from '@txo/offline-redux'

import type { SagaGenerator } from '../Model/Types'

const log = new Log('@txo.react-service.Sagas.ProcessServiceErrorSaga')

type ServiceOptions = {
  retryUntilOnlinePeriod?: number,
}

type ProcessServiceErrorAttributes = {
  serviceErrorList: ServiceError[],
  serviceOptions?: ServiceOptions,
}

type ProcessServiceErrorResult = {
  retryCall?: boolean,
}

export function * processServiceErrorSaga (
  attributes: ProcessServiceErrorAttributes,
): SagaGenerator<ProcessServiceErrorResult | undefined> {
  const { serviceErrorList, serviceOptions } = attributes

  // TODO: exchange with key
  if (serviceErrorList.some((key) => key === CODE_NETWORK_CONNECTION_ERROR)) {
    log.debug('NETWORK ERROR')
    yield put(offlineRedux.creators.setOffline())
    if (serviceOptions?.retryUntilOnlinePeriod) {
      const retryUntilOnlinePeriod = serviceOptions.retryUntilOnlinePeriod
      yield race({
        offlineClear: take(offlineRedux.types.unsetOffline),
        delay: delay(retryUntilOnlinePeriod),
      })
      return {
        retryCall: true,
      }
    }
  } else {
    yield put(offlineRedux.creators.unsetOffline())
  }
}
