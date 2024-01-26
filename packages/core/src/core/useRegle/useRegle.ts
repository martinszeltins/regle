import { PartialDeep, RequiredDeep } from 'type-fest';
import { ComputedRef, Ref, computed, isRef, ref, shallowRef, toRaw } from 'vue';
import {
  $InternalReglePartialValidationTree,
  AllRulesDeclarations,
  DeepReactiveState,
  DeepSafeFormState,
  LocalRegleBehaviourOptions,
  Regle,
  RegleBehaviourOptions,
  RegleErrorTree,
  ReglePartialValidationTree,
  RegleStatus,
  RegleValidationTree,
  ResolvedRegleBehaviourOptions,
} from '../../types';
import { DeepMaybeRef } from '../../types/utils';
import { useStateProperties } from './useStateProperties';

export function createUseRegleComposable<TCustomRules extends Partial<AllRulesDeclarations>>(
  customRules?: () => TCustomRules,
  options?: RegleBehaviourOptions
) {
  const globalOptions: RequiredDeep<RegleBehaviourOptions> = {
    autoDirty: options?.autoDirty ?? true,
    lazy: options?.lazy ?? false,
    rewardEarly: options?.rewardEarly ?? false,
  };

  function useRegle<
    TState extends Record<string, any>,
    TRules extends ReglePartialValidationTree<TState, Partial<AllRulesDeclarations> & TCustomRules>,
    TValid = keyof TRules extends keyof ReglePartialValidationTree<
      TState,
      Partial<AllRulesDeclarations> & TCustomRules
    >
      ? true
      : false,
  >(
    state: Ref<TState> | DeepReactiveState<TState>,
    rulesFactory: TValid extends true ? TRules | (() => TRules) | ComputedRef<TRules> : never,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> & LocalRegleBehaviourOptions<TState>
  ): Regle<TState, TRules> {
    const scopeRules = isRef(rulesFactory)
      ? rulesFactory
      : computed(
          (typeof (rulesFactory as TRules | (() => TRules)) === 'function'
            ? rulesFactory
            : () => rulesFactory) as any
        );

    const resolvedOptions: ResolvedRegleBehaviourOptions = {
      ...globalOptions,
      ...options,
    } as any;

    const processedState = ref(state) as Ref<TState>;

    const initialState = shallowRef<TState>(structuredClone(toRaw(processedState.value)));

    const { $regle, errors } = useStateProperties(
      scopeRules as ComputedRef<$InternalReglePartialValidationTree>,
      processedState,
      resolvedOptions,
      customRules
    );

    function resetForm() {
      state.value = toRaw(initialState.value) as TState;
      $regle.$reset();
    }

    const $valid = computed<boolean>(() => {
      return $regle.$valid && $regle.$dirty && !$regle.$pending;
    });

    const $invalid = computed<boolean>(() => {
      return ($regle.$invalid && $regle.$dirty) || $regle.$pending;
    });

    async function validateForm(): Promise<false | DeepSafeFormState<TState, TRules>> {
      $regle.$touch();
      const result = await $regle.$validate();
      if (result) {
        return state.value as any;
      }
      return false;
    }

    return {
      $state: state as Ref<PartialDeep<TState>>,
      $regle: $regle as RegleStatus<TState, TRules>,
      $errors: errors as RegleErrorTree<TRules>,
      resetForm,
      validateForm,
      $valid,
      $invalid,
    };
  }

  return useRegle;
}

export const useRegle = createUseRegleComposable();
