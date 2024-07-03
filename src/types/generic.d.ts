import { ISupportedServices } from '@/constants/services';
import { IUserData } from '@/schemas/userData.schema';

export type IPromptAction = 'next' | 'exit';
export type IEditAction = keyof IUserData;

export type StepsToAnything = Partial<Record<ISupportedServices, string[]>>;


