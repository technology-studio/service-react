/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2017-08-14T15:18:24+02:00
 * @Copyright: Technology Studio
**/

import type {
  Redux,
  ActionCreator,
  ReduxHandler,
} from '@txo/redux'
import {
  createRedux,
} from '@txo/redux'

import type { ServicePromiseHandlers } from '../../Model/Types'

// eslint-disable-next-line @typescript-eslint/ban-types
type AsyncState = {}

export type AsyncServiceCallAttributes<DATA, CALL_DATA> = {
  promiseHandlers?: ServicePromiseHandlers<DATA, CALL_DATA>,
}

export type AsyncServiceActionCreators <ATTRIBUTES, DATA, CALL_DATA> = {
  serviceCall: ActionCreator<ATTRIBUTES, AsyncServiceCallAttributes<DATA, CALL_DATA> | undefined>,
}

export type AsyncServiceRedux<ATTRIBUTES, DATA, CALL_DATA> = Redux<AsyncState, AsyncServiceActionCreators<ATTRIBUTES, DATA, CALL_DATA>>

export const createAsyncServiceRedux = <ATTRIBUTES, DATA, CALL_DATA=undefined>(
  prefix: string,
): AsyncServiceRedux<ATTRIBUTES, DATA, CALL_DATA> => createRedux<AsyncState, {
    serviceCall: ReduxHandler<AsyncState, ATTRIBUTES>,
  }>({
    filter: '*',
    initialState: {
    },
    handlers: {
      serviceCall: (state: AsyncState) => state,
    },
    prefix,
  })
