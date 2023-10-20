import {
  createRule,
  FormRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
} from '@regle/core';
import { minValue } from 'validators/minValue';
import { ExtractValueFormRules } from '../types';
import { maxLength } from '../validators';

export function or<TRules extends FormRuleDeclaration<any, any>[]>(
  ...rules: [...TRules]
): RegleRuleDefinition<ExtractValueFormRules<TRules>[number]> {
  const isAnyRuleAsync = rules.some((rule) => {
    if (typeof rule === 'function') {
      return rule.constructor.name === 'AsyncFunction';
    } else {
      return rule._async;
    }
  });

  const params = rules
    .map((rule) => {
      if (typeof rule === 'function') {
        return null;
      } else {
        return rule._params;
      }
    })
    .filter((param): param is any => !!param);

  const validator = isAnyRuleAsync
    ? async (value: any | null | undefined, ...params: any[]) => {
        const results = await Promise.all(
          rules.map((rule) => {
            if (typeof rule === 'function') {
              return rule(value);
            } else {
              return rule.validator(value, ...params);
            }
          })
        );
        return results.some((result) => !!result);
      }
    : (value: any | null | undefined, ...params: any[]) => {
        return rules
          .map((rule) => {
            if (typeof rule === 'function') {
              return rule(value);
            } else {
              return rule.validator(value, ...params);
            }
          })
          .some((result) => !!result);
      };

  const newRule = createRule({
    type: 'or',
    validator: validator,
    message: '',
  });

  newRule._params = params;

  return newRule as RegleRuleDefinition;
}
