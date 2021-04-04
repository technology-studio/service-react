/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2019-01-14T20:41:08+01:00
 * @Copyright: Technology Studio
**/

import {
  race, delay,
} from 'redux-saga/effects'
import { ServiceError, ServiceErrorKey } from '@txo/service-prop'
import { Log } from '@txo/log'

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

  if (serviceErrorList.some(({ key }) => key === ServiceErrorKey.NETWORK_ERROR)) {
    log.debug('NETWORK ERROR')
    if (serviceOptions?.retryUntilOnlinePeriod) {
      const retryUntilOnlinePeriod = serviceOptions.retryUntilOnlinePeriod
      yield race({
        delay: delay(retryUntilOnlinePeriod),
      })
      return {
        retryCall: true,
      }
    }
  }
}
