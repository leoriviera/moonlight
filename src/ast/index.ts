import { Expression } from './expression';
import { IStatement, Program } from './statement';

export * from './expression';
export * from './statement';
export type Node = IStatement | Expression | Program;
