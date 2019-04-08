/*eslint-env jest, es6*/
import path from 'path';
import * as ts from 'typescript';
import { printReceived } from 'jest-matcher-utils';

expect.extend({
  hasError(received) {
    if (received.length > 0) {
      return {
        message: () => printReceived(received.join('\n')),
        pass: false
      };
    }
    return {
      message: () => 'No error occurred',
      pass: true
    };
  }
});

describe('type error check', () => {
  test('compile check.tsx', () => {
    const program = ts.createProgram([ path.join(__dirname, 'check.tsx') ], {
      target: 'es5',
      jsx: 'react',
      strict: true,
      allowSyntheticDefaultImports: true,
      allowUnreachableCode: false,
      allowUnusedLabels: false,
      suppressImplicitAnyIndexErrors: true,
      noImplicitReturns: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      forceConsistentCasingInFileNames: true,
      noEmit: true
    });

    const errors = [];
    ts.getPreEmitDiagnostics(program)
    .concat(program.emit().diagnostics)
    .forEach((d) => {
      if (d.file) {
        const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
        const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
        errors.push([
          path.basename(d.file.fileName),
          `(${line + 1},${character + 1}):`,
          message
        ].join(' '));
      } else {
        errors.push(`${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
      }
    });

    expect(errors).hasError();
  });
});
