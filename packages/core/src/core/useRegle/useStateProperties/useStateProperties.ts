import type { ComputedRef, Ref } from 'vue';
import { reactive } from 'vue';
import type {
  $InternalReglePartialRuleTree,
  CustomRulesDeclarationTree,
  RegleShortcutDefinition,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { useStorage } from '../../useStorage';
import { createReactiveNestedStatus } from './createReactiveNestedStatus';

export function useStateProperties({
  initialState,
  options,
  scopeRules,
  state,
  customRules,
  shortcuts,
}: {
  scopeRules: ComputedRef<$InternalReglePartialRuleTree>;
  state: Ref<Record<string, any>>;
  options: ResolvedRegleBehaviourOptions;
  initialState: Record<string, any>;
  customRules?: () => CustomRulesDeclarationTree;
  shortcuts: RegleShortcutDefinition | undefined;
}) {
  const storage = useStorage();

  const regle = reactive(
    createReactiveNestedStatus({
      rootRules: scopeRules,
      rulesDef: scopeRules,
      state,
      customMessages: customRules?.(),
      storage,
      options,
      externalErrors: options.externalErrors as any,
      validationGroups: options.validationGroups,
      initialState,
      shortcuts,
      fieldName: 'root',
      path: '',
    })
  );

  return regle;
}
