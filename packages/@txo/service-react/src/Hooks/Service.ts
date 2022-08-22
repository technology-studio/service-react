/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date: 2021-03-26T09:03:21+01:00
 * @Copyright: Technology Studio
**/

import {
  useCallback,
  useMemo,
} from 'react'
import {
  useSelector,
  useDispatch,
} from 'react-redux'

import type {
  BooleanMap,
  ServiceProp,
  ValueOrValueMapper,
  CallAttributes,
  ServiceErrorException,
  ServiceCallResult,
} from '@txo/service-prop'
import { evaluateValue } from '../Api/EvaulatedValueHelper'
import type {
  ContextServiceState,
  ContextServiceRedux,
} from '../Redux/Services'

import {
  GLOBAL_CONTEXT,
  selectContextServiceState,
} from '../Redux/Services/Selectors'
import type {
  PromiseLikeServiceCallResult,
} from '../Model/Types'

type ServiceDeclaration<
  ATTRIBUTES extends Record<string, unknown> | undefined,
  DATA,
  REDUX_STATE,
  CALL_DATA = undefined,
  > = {
    context?: ValueOrValueMapper<string>,
    validationAttributes?: ValueOrValueMapper<string[] | BooleanMap>,
    selector: (state: REDUX_STATE) => ContextServiceState<DATA>,
    // eslint-disable-next-line @typescript-eslint/ban-types
    redux: ContextServiceRedux<NonNullable<ATTRIBUTES> | {}, DATA, CALL_DATA>,
  }

export const useService = <
  ATTRIBUTES extends Record<string, unknown> | undefined,
  DATA,
  CALL_ATTRIBUTES extends CallAttributes<ATTRIBUTES> | undefined,
  REDUX_STATE,
  CALL_DATA = undefined,
  >(
    serviceDeclaration: ServiceDeclaration<ATTRIBUTES, DATA, REDUX_STATE, CALL_DATA>,
  ): ServiceProp<ATTRIBUTES, DATA, CALL_ATTRIBUTES, CALL_DATA> => {
  const {
    context = GLOBAL_CONTEXT,
    validationAttributes,
    selector,
    redux,
  } = serviceDeclaration
  const evaluatedContext = evaluateValue(context)
  const dispatch = useDispatch()
  const contextServiceState = useSelector(selector)
  const { data, fetching, exception } = selectContextServiceState(contextServiceState, evaluatedContext)

  const clear = useCallback(
    (callContext?: string) => dispatch(
      redux.creators.serviceClear(
        undefined,
        { context: evaluatedContext + (callContext ? `.${callContext}` : '') },
      ),
    ), [dispatch, evaluatedContext, redux.creators])

  const clearException = useCallback((serviceErrorException: ServiceErrorException) => {
    dispatch(
      redux.creators.clearException(
        undefined,
        { context: serviceErrorException.context },
      ),
    )
  }, [dispatch, redux.creators])

  const call = useCallback(async (
    attributes: ATTRIBUTES,
    callAttributes?: CALL_ATTRIBUTES,
  ): Promise<ServiceCallResult<DATA, CALL_DATA>> => (
    new Promise((resolve, reject) => {
      const serviceCallResolve = (
        serviceCallResult: PromiseLikeServiceCallResult<DATA, CALL_DATA>,
      ): void => {
        resolve(
          Promise.resolve(serviceCallResult),
        )
      }
      dispatch(redux.creators.serviceCall(attributes ?? {}, {
        promiseHandlers: { resolve: serviceCallResolve, reject },
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        context: evaluatedContext + (callAttributes?.context ? `.${callAttributes.context!}` : ''),
      }))
    })
  ), [clear, clearException, dispatch, evaluatedContext, redux.creators, validationAttributes])

  return useMemo<ServiceProp<ATTRIBUTES, DATA, CALL_ATTRIBUTES, CALL_DATA>>(() => ({
    call,
    clear,
    clearException,
    options: {
      validationAttributes,
    },
    data,
    exception,
    fetching,
  }), [call, clear, clearException, data, exception, fetching, validationAttributes])
}
