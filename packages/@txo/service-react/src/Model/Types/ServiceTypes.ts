/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date: 2021-03-28T11:03:61+02:00
 * @Copyright: Technology Studio
**/

import type { Action } from '@txo/redux'

import type { SagaGenerator } from './SagaTypes'

import type { ServiceError, ServiceCallResult } from '@txo/service-prop'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DefaultRootService {
}

export type PromiseLikeServiceCallResult<DATA, CALL_DATA> = (
  Promise<ServiceCallResult<DATA, CALL_DATA>> |
  ServiceCallResult<DATA, CALL_DATA>
)

export type ServicePromiseHandlers<DATA, CALL_DATA> = {
  resolve: (result: PromiseLikeServiceCallResult<DATA, CALL_DATA>) => void,
  reject: (errorList: ServiceError[]) => void,
}
export type ServiceAttributes = {
  service: DefaultRootService,
}

export type ServiceAction<ATTRIBUTES, DATA, CALL_DATA> = Action & {
  attributes: ATTRIBUTES,
  promiseHandlers?: ServicePromiseHandlers<DATA, CALL_DATA>,
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type ContextServiceAction<ATTRIBUTES = {}, DATA = undefined, CALL_DATA = undefined> = (
  ServiceAction<ATTRIBUTES, DATA, CALL_DATA> & {
    context: string,
  }
)

export type ServiceCall<
    ATTRIBUTES,
    DATA = undefined,
    SERVICE_ATTRIBUTES extends ServiceAttributes = ServiceAttributes,
    CALL_DATA = undefined
> = (
  attributes: ATTRIBUTES,
  serviceAttributes: SERVICE_ATTRIBUTES
) => Promise<ServiceCallResult<DATA, CALL_DATA>> | SagaGenerator<ServiceCallResult<DATA, CALL_DATA>>
