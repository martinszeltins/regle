import { RegleRuleWithParamsDefinition, createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const macAddress: RegleRuleWithParamsDefinition<
  string,
  [separator?: string | undefined],
  false
> = createRule<string, [separator?: string]>({
  validator(value, separator = ':') {
    if (ruleHelpers.isEmpty(value)) {
      return true;
    }

    if (typeof value !== 'string') {
      return false;
    }

    const parts =
      typeof separator === 'string' && separator !== ''
        ? value.split(separator)
        : value.length === 12 || value.length === 16
        ? value.match(/.{2}/g)
        : null;

    return parts !== null && (parts.length === 6 || parts.length === 8) && parts.every(hexValid);
  },
  message: 'The value is not a valid MAC Address',
  type: 'macAddress',
});

const hexValid = (hex: string) => hex.toLowerCase().match(/^[0-9a-f]{2}$/);
