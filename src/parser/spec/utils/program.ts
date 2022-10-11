import { ExecutionContext } from 'ava';

import { Program } from '../../../ast';

export const assertProgramValid = (
    t: ExecutionContext,
    program: Program,
    length = 1
) => {
    t.not(program, null);
    t.not(program?.statements, undefined);
    t.is(program?.statements.length, length);
};
