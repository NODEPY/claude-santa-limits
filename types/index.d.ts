export type Limit = { kind: string; percentUsed: number; resetsAt?: string }

declare module 'claude-code' {
  interface PluginState {
    'santa-limits': { limits: Limit[]; now: number }
  }
}
