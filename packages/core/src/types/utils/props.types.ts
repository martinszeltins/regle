import type { DefaultValidators } from '../../core';
import type { useRegleFn } from '../../core/useRegle';
import type { Regle } from '../core';
import type { AllRulesDeclarations, UnwrapRuleTree } from '../rules';
import type { Prettify } from './misc.types';

export type InferRegleRoot<T extends (...args: any[]) => Regle<any, any, any, any>> = T extends (
  ...args: any[]
) => infer U
  ? U extends Regle<any, any, any, any>
    ? Prettify<U['r$']>
    : never
  : never;

export type InferRegleRules<T extends useRegleFn<any, any>> =
  T extends useRegleFn<infer U, any> ? UnwrapRuleTree<Partial<U> & Partial<DefaultValidators>> : {};

export type InferRegleShortcuts<T extends useRegleFn<any, any>> =
  T extends useRegleFn<any, infer U> ? U : {};

export type RegleEnforceRequiredRules<TRules extends keyof DefaultValidators> = Omit<
  DefaultValidators,
  TRules
> & {
  [K in TRules as keyof TRules]-?: NonNullable<DefaultValidators[K]>;
};

export type RegleEnforceCustomRequiredRules<
  T extends Partial<AllRulesDeclarations> | useRegleFn<any>,
  TRules extends T extends useRegleFn<any> ? keyof InferRegleRules<T> : keyof T,
> = Omit<
  T extends useRegleFn<any>
    ? InferRegleRules<T>
    : T extends Partial<AllRulesDeclarations>
      ? UnwrapRuleTree<T>
      : {},
  TRules
> & {
  [K in TRules]-?: T extends useRegleFn<any>
    ? K extends keyof InferRegleRules<T>
      ? NonNullable<InferRegleRules<T>[K]>
      : never
    : K extends keyof T
      ? NonNullable<T[K]>
      : never;
};
