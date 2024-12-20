/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2019-01-14T20:41:08+01:00
 * @Copyright: Technology Studio
**/

import {
  race, delay,
} from 'redux-saga/effects'
import type { ServiceOperationError } from '@txo/service-prop'
import { ServiceErrorKey } from '@txo/service-prop'
import { Log } from '@txo/log'

import type { SagaGenerator } from '../Model/Types'

const log = new Log('@txo.react-service.Sagas.ProcessServiceOperationErrorSaga')

type ServiceOptions = {
  retryUntilOnlinePeriod?: number,
}

type ProcessServiceOperationErrorAttributes = {
  serviceOperationError: ServiceOperationError,
  serviceOptions?: ServiceOptions,
}

export type ProcessServiceOperationErrorResult = {
  retryCall?: boolean,
}

export function * processServiceOperationErrorSaga (
  attributes: ProcessServiceOperationErrorAttributes,
): SagaGenerator<ProcessServiceOperationErrorResult | undefined> {
  const { serviceOperationError: { serviceErrorList }, serviceOptions } = attributes

  if (serviceErrorList.some(({ key }) => key as ServiceErrorKey === ServiceErrorKey.NETWORK_ERROR)) {
    log.debug('NETWORK ERROR')
    if (serviceOptions?.retryUntilOnlinePeriod != null && serviceOptions.retryUntilOnlinePeriod > 0) {
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
