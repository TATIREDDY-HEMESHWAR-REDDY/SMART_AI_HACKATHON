declare module 'node:sqlite' {
  export class StatementSync {
    run(...parameters: unknown[]): { changes: number; lastInsertRowid: number | bigint };
    get(...parameters: unknown[]): unknown;
    all(...parameters: unknown[]): unknown[];
  }
  export class DatabaseSync {
    constructor(path: string, options?: { open?: boolean });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }
}
