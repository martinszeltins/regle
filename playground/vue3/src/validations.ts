import { createRule, defineCustomValidators } from '@regle/core';
import { isEmpty, withMessage, maxLength } from '@regle/validators';

export const not = createRule<unknown, [target: unknown]>({
  type: 'not',
  validator(value, target) {
    if (isEmpty(value)) {
      return true;
    }
    return value !== target;
  },
  message(value, target) {
    return `Value can't be ${target}`;
  },
});

export function timeout(count: number) {
  return new Promise((resolve) => setTimeout(resolve, count));
}

export const asyncEmail = createRule<string, [limit: number]>({
  type: 'email',
  async validator(value, limit) {
    if (isEmpty(value)) {
      return true;
    }
    await timeout(1000);
    return limit === 2;
  },
  message: 'Value is not an email',
});

export const useRegle = defineCustomValidators(() => ({
  not,
  maxLength: withMessage(maxLength, (value, count) => {
    return `ehooo ${count} is max`;
  }),
  asyncEmail,
}));
