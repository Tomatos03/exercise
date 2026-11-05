import type { InjectionKey } from 'vue'

export type ConfirmFn = (message: string, confirmText?: string) => Promise<boolean>

export const confirmKey: InjectionKey<ConfirmFn> = Symbol('confirm')
