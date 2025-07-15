// Type definitions for papaparse
declare module 'papaparse' {
  export interface ParseConfig {
    header?: boolean;
    complete?: (results: ParseResult) => void;
    error?: (error: any) => void;
  }

  export interface ParseResult {
    data: any[];
    errors: any[];
    meta: any;
  }

  export function parse(file: File, config?: ParseConfig): void;
}
