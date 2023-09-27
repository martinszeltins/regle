import { createRule } from '..';
import { InferShibieRule, ShibieInternalRuleDefs, ShibieRule } from '../types';

export function withMessage<
  TValue extends any,
  TParams extends any[],
  TNewParams extends any[],
  TNewMessage extends string | ((value: TValue, ...params: TNewParams) => string),
>(rule: ShibieRule<TValue, TParams>, newMessage: TNewMessage): InferShibieRule<TValue, TNewParams> {
  const { _type, _validator, _active } = rule as unknown as ShibieInternalRuleDefs<TValue, TParams>;

  const newRule = createRule({
    type: _type,
    validator: _validator,
    active: _active,
    message: newMessage as unknown as any,
  });

  (newRule as unknown as ShibieInternalRuleDefs<TValue, TParams>)._patched = true;

  return newRule as unknown as InferShibieRule<TValue, TNewParams>;
}
