/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2017-08-14T15:18:24+02:00
 * @Copyright: Technology Studio
**/

import type {
  Redux,
  ReduxHandler,
} from '@txo/redux'
import {
  createRedux,
} from '@txo/redux'

type AsyncState = {}

type Handlers<DATA, ATTRIBUTES> = {
  serviceCall: ReduxHandler<DATA, ATTRIBUTES>,
}

export type AsyncServiceRedux<ATTRIBUTES> = Redux<AsyncState, AsyncState, keyof Handlers<AsyncState, ATTRIBUTES>, Handlers<AsyncState, ATTRIBUTES>>

export const createAsyncServiceRedux = <ATTRIBUTES>(
  prefix: string,
): AsyncServiceRedux<ATTRIBUTES> => createRedux<AsyncState, keyof Handlers<AsyncState, ATTRIBUTES>, Handlers<AsyncState, ATTRIBUTES>>({
  filter: '*',
  initialState: {
  },
  handlers: {
    serviceCall: (state: AsyncState) => state,
  },
  prefix,
})
