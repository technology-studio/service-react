/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date: 2021-03-28T11:03:38+02:00
 * @Copyright: Technology Studio
**/

import type { SagaIterator } from 'redux-saga'

export type ServiceOptions = {
  retryUntilOnlinePeriod?: number,
}

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type SagaGenerator<RT = void> = SagaIterator<RT> & {
  [Symbol.iterator]: () => SagaGenerator<RT>,
}
