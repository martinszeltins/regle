import { DefaultValidators } from '../../core/defaultValidators';
import { ShibieRuleRaw } from './rule.definition.type';

export type CustomRulesDeclarationTree = Record<string, ShibieRuleRaw>;
export type AllRulesDeclarations = CustomRulesDeclarationTree & DefaultValidators;
