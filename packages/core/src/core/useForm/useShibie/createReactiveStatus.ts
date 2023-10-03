import { ComputedRef, Ref, computed, reactive, ref, toRef, watch } from 'vue';
import { isEmpty } from '../../../helpers';
import type {
  CustomRulesDeclarationTree,
  PossibleShibieFieldStatus,
  ShibieFormPropertyType,
  ShibieRuleStatus,
  ShibieStatus,
  ShibiePartialValidationTree,
  ShibieSoftRuleStatus,
} from '../../../types';
import { unwrapRuleParameters } from '../../createRule/unwrapRuleParameters';
import { isCollectionRulesDef, isNestedRulesDef, isValidatorRulesDef } from '../shibie.guards';

type PendingFields = { key: string; state: boolean };

export function createReactiveNestedStatus(
  scopeRules: Ref<ShibiePartialValidationTree<Record<string, any>>>,
  state: Ref<Record<string, any>>,
  customRules: () => Partial<CustomRulesDeclarationTree>
): ShibieStatus<Record<string, any>, ShibiePartialValidationTree<Record<string, any>>> {
  const $fields = reactive(
    Object.fromEntries(
      Object.entries(scopeRules.value)
        .map(([statePropKey, statePropRules]) => {
          if (statePropRules) {
            const stateRef = toRef(state.value, statePropKey);
            const statePropRulesRef = toRef(() => statePropRules);
            return [
              statePropKey,
              createReactiveFieldStatus(stateRef, statePropRulesRef, customRules),
            ];
          }
          return [];
        })
        .filter(
          (rule): rule is [string, PossibleShibieFieldStatus] => !!rule.length && rule[1] != null
        )
    )
  );

  const $dirty = computed<boolean>(() => {
    return Object.entries($fields).every(([key, statusOrField]) => {
      return statusOrField.$dirty;
    });
  });

  const $anyDirty = computed<boolean>(() => {
    return Object.entries($fields).some(([key, statusOrField]) => {
      return statusOrField.$dirty;
    });
  });

  const $invalid = computed<boolean>(() => {
    return Object.entries($fields).some(([key, statusOrField]) => {
      return statusOrField.$invalid;
    });
  });

  const $error = computed<boolean>(() => {
    return $invalid.value && !$pending.value && $dirty.value;
  });

  const $pending = computed<boolean>(() => {
    return Object.entries($fields).some(([key, statusOrField]) => {
      return statusOrField.$pending;
    });
  });

  function $reset() {
    Object.entries($fields).forEach(([key, statusOrField]) => {
      statusOrField.$reset();
    });
  }

  function $touch() {
    Object.entries($fields).forEach(([key, statusOrField]) => {
      statusOrField.$touch();
    });
  }

  const $valid = computed(() => !$invalid.value);

  return reactive({
    $dirty,
    $anyDirty,
    $invalid,
    $valid,
    $error,
    $pending,
    $value: state,
    $fields,
    $reset,
    $touch,
  }) satisfies ShibieStatus<Record<string, any>, ShibiePartialValidationTree<Record<string, any>>>;
}

export function createReactiveFieldStatus(
  state: Ref<unknown>,
  rulesDef: Ref<ShibieFormPropertyType>,
  customRules: () => Partial<CustomRulesDeclarationTree>
): PossibleShibieFieldStatus | null {
  if (isCollectionRulesDef(rulesDef)) {
    return {} as any;
  } else if (isNestedRulesDef(state, rulesDef)) {
    return createReactiveNestedStatus(rulesDef, state as Ref<Record<string, any>>, customRules);
  } else if (isValidatorRulesDef(rulesDef)) {
    const customMessages = customRules();

    const pendingFields = ref<PendingFields[]>([]);

    const rulesResults = computed(() => {
      return Object.fromEntries(
        Object.entries(rulesDef.value)
          .map(([ruleKey, rule]) => {
            let ruleResult: boolean = true;
            let $message: string = '';
            let $type: string;
            let $validator: (value: any, ...params: any[]) => boolean | Promise<boolean>;
            let $active: boolean;
            let $params: any[] | undefined;

            const $pending = pendingFields.value.find(({ key }) => key === ruleKey)?.state ?? false;

            let params =
              typeof rule === 'function' ? [] : unwrapRuleParameters(rule?._params ?? []);

            const customMessageRule = customMessages[ruleKey]?.message;
            if (customMessageRule) {
              if (typeof customMessageRule === 'function') {
                $message = customMessageRule(state.value, ...params);
              } else {
                $message = customMessageRule;
              }
            }
            if (rule) {
              if (typeof rule === 'function') {
                const resultOrPromise = rule(state.value);
                // TODO Async rules
                // if (resultOrPromise instanceof Promise) {
                //   resultOrPromise.then(() => {
                //   });
                // } else {
                // }
                ruleResult = resultOrPromise;
                $type = ruleKey;
                $validator = rule;
                $active = true;
              } else {
                ruleResult = rule.validator(state.value, ...params);
                if (!(customMessageRule && !rule._patched)) {
                  if (typeof rule.message === 'function') {
                    $message = rule.message(state.value, ...params);
                  } else {
                    $message = rule.message;
                  }
                }

                if (typeof rule.active === 'function') {
                  $active = rule.active(state.value, ...params);
                } else {
                  $active = rule.active;
                }
                $type = rule.type === '__inline' ? ruleKey : rule.type;
                $validator = rule.validator;
              }

              if (isEmpty($message)) {
                $message = 'Error';
                console.warn(`No error message defined for ${ruleKey}`);
              }

              return [
                ruleKey,
                {
                  $active,
                  $message,
                  $pending,
                  ...($params && { $params }),
                  $type: $type,
                  $valid: ruleResult,
                  $validator,
                },
              ] satisfies [string, ShibieSoftRuleStatus];
            }
            return [];
          })
          .filter((ruleDef): ruleDef is [string, ShibieSoftRuleStatus] => !!ruleDef.length)
      ) satisfies Record<string, ShibieSoftRuleStatus>;
    });

    const $dirty = ref(false);
    const $anyDirty = computed(() => $dirty.value);

    const $error = computed<boolean>(() => {
      return $invalid.value && !$pending.value && $dirty.value;
    });

    const $pending = computed(() => {
      return !!pendingFields.value.length;
    });

    const $invalid = computed(() => {
      return Object.entries(rulesResults.value).some(([key, ruleResult]) => {
        return !ruleResult.$valid;
      });
    });

    function $reset() {
      $dirty.value = false;
    }

    function $touch() {
      $dirty.value = true;
    }

    const $valid = computed(() => !$invalid.value);

    watch(state, () => {
      if (!$dirty.value) {
        $dirty.value = true;
      }
    });

    return reactive({
      $dirty,
      $anyDirty,
      $invalid,
      $error,
      $pending,
      $valid,
      $reset,
      $touch,
      $value: state,
      $rules: rulesResults as ComputedRef<Record<string, ShibieRuleStatus>>,
    });
  }

  return null;
}
