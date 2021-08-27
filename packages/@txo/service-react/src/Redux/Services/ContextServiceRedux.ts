/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2017-04-23T19:32:09+02:00
 * @Copyright: Technology Studio
**/

import update from 'immutability-helper'
import type { ServiceError } from '@txo/service-prop'
import {
  FilterNode,
  ReduxHandler,
} from '@txo/redux'
import {
  createContextRedux,
  ContextRedux,
  ContextState,
  ContextActionCreator,
} from '@txo/context-redux'

import type {
  ServicePromiseHandlers,
} from '../../Model/Types'

export type ServiceState<DATA> = {
  fetching: boolean,
  errorList: ServiceError[] | null,
  data: DATA | null,
}

export type ContextServiceState<DATA = undefined> = ContextState<ServiceState<DATA>>

const defaultFilter = <DATA>(contextServiceReduxState: ContextServiceState<DATA>): ContextServiceState<DATA> => {
  if (contextServiceReduxState) {
    const _contextServiceReduxState: Record<string, unknown> = contextServiceReduxState
    if (typeof _contextServiceReduxState.fetching === 'boolean') {
      return (_contextServiceReduxState.data !== undefined
        ? {
            fetching: false,
            data: _contextServiceReduxState.data,
          }
        : {
            fetching: false,
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
  errorList: ServiceError[],
}

type ClearErrorAttributes = {
  errorList: ServiceError[],
}

export type ContextServiceActionCreators <ATTRIBUTES extends Record<string, unknown>, DATA, CALL_DATA> = {
  serviceCall: ContextActionCreator<ATTRIBUTES, ContextServiceCallActionAttributes<DATA, CALL_DATA>>,
  serviceSuccess: ContextActionCreator<ContextServiceSuccessAttributes<DATA>, ContextServiceActionAttributes>,
  serviceFailure: ContextActionCreator<ContextServiceFailureAttributes, ContextServiceActionAttributes>,
  serviceClear: ContextActionCreator<undefined, ContextServiceActionAttributes>,
  clearError: ContextActionCreator<ClearErrorAttributes, ContextServiceActionAttributes>,
}

export type ContextServiceRedux<
  ATTRIBUTES extends Record<string, unknown>,
  DATA,
  CALL_DATA
> = ContextRedux<ServiceState<DATA>, ContextServiceActionCreators<ATTRIBUTES, DATA, CALL_DATA>>

export const createContextServiceRedux = <
ATTRIBUTES extends Record<string, unknown>,
DATA = undefined,
CALL_DATA = undefined,
>({ filter, prefix, resettable }: {
    filter: FilterNode,
    prefix: string,
    resettable?: boolean,
  }): ContextServiceRedux<ATTRIBUTES, DATA, CALL_DATA> => createContextRedux<ServiceState<DATA>, {
    serviceCall: ReduxHandler<ServiceState<DATA>, ATTRIBUTES>,
    serviceSuccess: ReduxHandler<ServiceState<DATA>, ContextServiceSuccessAttributes<DATA>>,
    serviceFailure: ReduxHandler<ServiceState<DATA>, ContextServiceFailureAttributes>,
    serviceClear: ReduxHandler<ServiceState<DATA>, undefined>,
    clearError: ReduxHandler<ServiceState<DATA>, ClearErrorAttributes>,
  }>({
    filter: filter ?? defaultFilter,
    initialState: {
      fetching: false,
      errorList: null,
      data: null,
    },
    handlers: {
      serviceCall: (state: ServiceState<DATA>) => (
        update(state, { $merge: { fetching: true, errorList: null } })
      ),
      serviceSuccess: (state: ServiceState<DATA>, { data }: ContextServiceSuccessAttributes<DATA>) => (
        update(state, { $merge: { fetching: false, errorList: null, data } })
      ),
      serviceFailure: (state: ServiceState<DATA>, { errorList }: ContextServiceFailureAttributes) => (
        update(state, { $merge: { fetching: false, errorList: errorList } })
      ),
      serviceClear: (state: ServiceState<DATA>) => (
        update(state, { $merge: { fetching: false, errorList: null, data: null } })
      ),
      clearError: (state: ServiceState<DATA>) => update(state, { $merge: { errorList: null } }),
    },
    prefix,
    resettable,
  })
