import { SupportedServices } from '@/constants/services';

export type ISupportedServices = keyof typeof SupportedServices;
export type IPromptAction = 'next' | 'exit';
export type IEditAction = keyof IUserData;

export type StepsToAnything = Partial<Record<IServices, string[]>>;
