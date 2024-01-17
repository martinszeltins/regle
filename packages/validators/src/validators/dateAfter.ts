import { ruleHelpers } from '../helpers';
import { createRule, defineType, Maybe, RegleRuleWithParamsDefinition } from '@regle/core';

export const dateAfter: RegleRuleWithParamsDefinition<Date, [after: Maybe<Date>]> = createRule({
  type: defineType<Date, [after: Maybe<Date>]>('dateAfter'),
  validator: (value, after) => {
    if (ruleHelpers.isDate(value) && ruleHelpers.isDate(after)) {
      return ruleHelpers.toDate(value).getTime() > ruleHelpers.toDate(after).getTime();
    }
    return true;
  },
  message: (_, { $params: [after] }) => {
    return `The date must be after ${after}`;
  },
});