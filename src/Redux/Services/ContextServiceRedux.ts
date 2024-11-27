/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2017-04-23T19:32:09+02:00
 * @Copyright: Technology Studio
**/

import update from 'immutability-helper'
import type { ServiceOperationError } from '@txo/service-prop'
import type {
  FilterNode,
  ReduxHandler,
} from '@txo/redux'
import type {
  ContextRedux,
  ContextState,
  ContextActionCreator,
} from '@txo/context-redux'
import {
  createContextRedux,
} from '@txo/context-redux'

import type {
  ServicePromiseHandlers,
} from '../../Model/Types'

export type ServiceState<DATA> = {
  isFetching: boolean,
  error: ServiceOperationError | null,
  data: DATA | null,
}

export type ContextServiceState<DATA = undefined> = ContextState<ServiceState<DATA>>

const defaultFilter = <DATA>(contextServiceReduxState: ContextServiceState<DATA>): ContextServiceState<DATA> => {
  if (contextServiceReduxState != null) {
    const _contextServiceReduxState: Record<string, unknown> = contextServiceReduxState
    if (typeof _contextServiceReduxState.isFetching === 'boolean') {
      return (_contextServiceReduxState.data !== undefined
        ? {
          isFetching: false,
          data: _contextServiceReduxState.data,
        }
        : {
          isFetching: false,
        })
    }
    return Object.keys(_contextServiceReduxState).reduce(
      (state: Record<string, unknown>, key) => {
        state[key] = defaultFilter(_contextServiceReduxState[key] as ContextServiceState<DATA>)
        return state
      },
      {},
    )
  }
  return contextServiceReduxState
}

type ContextServiceActionAttributes = {
  context: string,
}

type ContextServiceCallActionAttributes<DATA, CALL_DATA> = ContextServiceActionAttributes & {
  promiseHandlers?: ServicePromiseHandlers<DATA, CALL_DATA>,
}

type ContextServiceSuccessAttributes<DATA> = {
  data: DATA,
}

type ContextServiceFailureAttributes = {
  error: ServiceOperationError,
}

export type ContextServiceActionCreators<ATTRIBUTES extends Record<string, unknown>, DATA, CALL_DATA> = {
  serviceCall: ContextActionCreator<ATTRIBUTES, ContextServiceCallActionAttributes<DATA, CALL_DATA>>,
  serviceSuccess: ContextActionCreator<ContextServiceSuccessAttributes<DATA>, ContextServiceActionAttributes>,
  serviceFailure: ContextActionCreator<ContextServiceFailureAttributes, ContextServiceActionAttributes>,
  serviceClear: ContextActionCreator<undefined, ContextServiceActionAttributes>,
  clearException: ContextActionCreator<undefined, ContextServiceActionAttributes>,
}

type Handlers<DATA, ATTRIBUTES> = {
  serviceCall: ReduxHandler<ServiceState<DATA>, ATTRIBUTES>,
  serviceSuccess: ReduxHandler<ServiceState<DATA>, ContextServiceSuccessAttributes<DATA>>,
  serviceFailure: ReduxHandler<ServiceState<DATA>, ContextServiceFailureAttributes>,
  serviceClear: ReduxHandler<ServiceState<DATA>, undefined>,
  clearException: ReduxHandler<ServiceState<DATA>, undefined>,
}

export type ContextServiceRedux<
  ATTRIBUTES extends Record<string, unknown>,
  DATA,
> = ContextRedux<ServiceState<DATA>, keyof Handlers<DATA, ATTRIBUTES>, Handlers<DATA, ATTRIBUTES>>

export const createContextServiceRedux = <
  ATTRIBUTES extends Record<string, unknown>,
  DATA = undefined,
>({ filter, prefix, resettable }: {
  filter?: FilterNode,
  prefix: string,
  resettable?: boolean,
}): ContextServiceRedux<ATTRIBUTES, DATA> => createContextRedux<ServiceState<DATA>, keyof Handlers<DATA, ATTRIBUTES>, Handlers<DATA, ATTRIBUTES>>({
  filter: filter ?? defaultFilter,
  initialState: {
    isFetching: false,
    error: null,
    data: null,
  },
  handlers: {
    serviceCall: (state: ServiceState<DATA>) => (
      update(state, { $merge: { isFetching: true, error: null } })
    ),
    serviceSuccess: (state: ServiceState<DATA>, { data }: ContextServiceSuccessAttributes<DATA>) => (
      update(state, { $merge: { isFetching: false, error: null, data } })
    ),
    serviceFailure: (state: ServiceState<DATA>, { error }: ContextServiceFailureAttributes) => (
      update(state, { $merge: { isFetching: false, error } })
    ),
    serviceClear: (state: ServiceState<DATA>) => (
      update(state, { $merge: { isFetching: false, error: null, data: null } })
    ),
    clearException: (state: ServiceState<DATA>) => update(state, { $merge: { error: null } }),
  },
  prefix,
  resettable,
})
