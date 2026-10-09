import { TRuleDTO } from './rule-dto.type';

export type TRuleResponse = {
  logsPreservedPeriod: number;
  id: number;
  customerId: number;
  identifier: string;
  common: boolean;
  rules: TRuleDTO[];
};
