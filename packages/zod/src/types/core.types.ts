import type { RegleCommonStatus, RegleRuleStatus } from '@regle/core';
import type { PartialDeep } from 'type-fest';
import type { z } from 'zod';
import type { toZod } from './zod.types';
import type { ZodToRegleCollectionErrors, ZodToRegleErrorTree } from './errors.types';

export interface ZodRegle<TState extends Record<string, any>, TSchema extends toZod<any>> {
  r$: ZodRegleStatus<TState, TSchema>;
}

export type ZodRegleResult<TSchema extends toZod<any>> =
  | { result: false; data: PartialDeep<z.output<TSchema>> }
  | { result: true; data: z.output<TSchema> };

/**
 * @public
 */
export interface ZodRegleStatus<
  TState extends Record<string, any> = Record<string, any>,
  TSchema extends toZod<any> = toZod<any>,
> extends RegleCommonStatus<TState> {
  readonly $fields: TSchema extends z.ZodObject<infer O extends z.ZodRawShape>
    ? {
        readonly [TKey in keyof O]: O[TKey] extends z.ZodTypeAny
          ? InferZodRegleStatusType<O[TKey], TState, TKey>
          : never;
      }
    : never;
  readonly $errors: ZodToRegleErrorTree<TSchema>;
  readonly $silentErrors: ZodToRegleErrorTree<TSchema>;
  $resetAll: () => void;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $validate: () => Promise<ZodRegleResult<TSchema>>;
}

/**
 * @public
 */
export type InferZodRegleStatusType<
  TSchema extends z.ZodTypeAny,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
> =
  TSchema extends z.ZodArray<infer A>
    ? ZodRegleCollectionStatus<A, TState[TKey]>
    : TSchema extends z.ZodObject<any>
      ? TState[TKey] extends Array<any>
        ? RegleCommonStatus<TState[TKey]>
        : ZodRegleStatus<TState[TKey], TSchema>
      : ZodRegleFieldStatus<TSchema, TState, TKey>;

/**
 * @public
 */
export interface ZodRegleFieldStatus<
  TSchema extends z.ZodTypeAny,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
> extends RegleCommonStatus<TState> {
  $value: TState[TKey];
  readonly $externalErrors?: string[];
  readonly $errors: string[];
  readonly $silentErrors: string[];
  readonly $rules: {
    [Key in `${string & TSchema['_def']['typeName']}`]: RegleRuleStatus<TState[TKey], []>;
  };
  $validate: () => Promise<false | z.output<TSchema>>;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
}

/**
 * @public
 */
export interface ZodRegleCollectionStatus<TSchema extends z.ZodTypeAny, TState extends any[]>
  extends Omit<ZodRegleFieldStatus<TSchema, TState>, '$errors' | '$silentErrors' | '$value'> {
  $value: TState;
  readonly $each: Array<InferZodRegleStatusType<NonNullable<TSchema>, TState, number>>;
  readonly $field: ZodRegleFieldStatus<TSchema, TState>;
  readonly $errors: ZodToRegleCollectionErrors<TSchema>;
  readonly $silentErrors: ZodToRegleCollectionErrors<TSchema>;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $validate: () => Promise<false | z.output<TSchema>>;
}
