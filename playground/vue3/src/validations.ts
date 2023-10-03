import { createRule, defineCustomValidators, maxLength } from '@shibie/core';
import { withMessage } from '@shibie/core/src/helpers';

export const not = createRule<any, [target: string]>({
  type: 'not',
  validator(value, target) {
    return value !== target;
  },
  message(value, target) {
    return `Value can't be ${target}`;
  },
});

export const { useForm } = defineCustomValidators(() => ({
  not,
  maxLength: withMessage(maxLength, (value, count) => {
    return `ehooo ${count} is max`;
  }),
}));
