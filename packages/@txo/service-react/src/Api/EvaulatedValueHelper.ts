/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date: 2021-03-27T15:03:94+01:00
 * @Copyright: Technology Studio
**/

import type { ValueOrValueMapper } from '@txo/service-prop'

export const evaluateValue = (value: ValueOrValueMapper<string>): string => {
  if (typeof value === 'function') {
    return value()
  }
  return value
}
