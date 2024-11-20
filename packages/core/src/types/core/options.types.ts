import type { RequiredDeep } from 'type-fest';
import type { MaybeRef } from 'vue';
import type {
  CustomRulesDeclarationTree,
  RegleExternalErrorTree,
  RegleFieldStatus,
  ReglePartialValidationTree,
  RegleStatus,
} from '../../types/rules';
import type { DeepMaybeRef } from '../../types/utils';

export interface RegleBehaviourOptions {
  /**
   * Only display error when calling `validateState()`
   * @default false
   */
  lazy?: boolean;
  /**
   * Automaticaly set the dirty set without the need of `$value` or `$touch`
   * @default true
   */
  autoDirty?: boolean;
  /**
   * The fields will turn valid when they are, but not invalid unless calling `validateState()`
   * @default false
   *
   * @experimental report any bug
   */
  rewardEarly?: boolean;
}

export interface LocalRegleBehaviourOptions<
  TState extends Record<string, any>,
  TRules extends ReglePartialValidationTree<TState, CustomRulesDeclarationTree>,
  TExternal extends RegleExternalErrorTree<TState>,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]>,
> {
  externalErrors?: MaybeRef<TExternal>;
  validationGroups?: (fields: RegleStatus<TState, TRules>['$fields']) => TValidationGroups;
}

export type RegleValidationGroupEntry = RegleFieldStatus<any, any>;

export interface RegleValidationGroupOutput {
  $invalid: boolean;
  $error: boolean;
  $pending: boolean;
  $dirty: boolean;
  $valid: boolean;
  $errors: string[];
  $silentErrors: string[];
}

export type FieldRegleBehaviourOptions = AddDollarToOptions<RegleBehaviourOptions> & {
  $debounce?: number;
};

export type ResolvedRegleBehaviourOptions = DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>> &
  LocalRegleBehaviourOptions<
    Record<string, any>,
    Record<string, any>,
    Record<string, any>,
    Record<string, any[]>
  >;

export type AddDollarToOptions<T extends Record<string, any>> = {
  [K in keyof T as `$${string & K}`]: T[K];
};

export type FilterDollarProperties<T extends Record<string, any>> = {
  [K in keyof T as K extends `$${string}` ? never : K]: T[K];
};

export type PickDollarProperties<T extends Record<string, any>> = {
  [K in keyof T as K extends `$${string}` ? K : never]: T[K];
};
