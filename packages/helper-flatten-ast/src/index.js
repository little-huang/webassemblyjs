// @flow

import { traverse, isInstruction } from "@webassemblyjs/ast";

export function flatten(ast: Node): Node {
  /**
   * Remove nested instructions
   *
   * For example:
   *
   * (call 0
   *   (i32.const 1)
   *   (i32.const 2)
   * )
   *
   * into:
   *
   * (i32.const 1)
   * (i32.const 2)
   * (call 0)
   *
   */
  function CallInstruction(path: NodePath<CallInstruction>) {
    const { instrArgs } = path.node;

    if (instrArgs.length === 0) {
      // no nested instructions
      return;
    }

    instrArgs.forEach(path.insertBefore);
    path.node.instrArgs = [];

    didFlatten = true;
  }

  function Instr(path: NodePath<Instr>) {
    if (path.node.args.length === 0) {
      // no nested instructions
      return;
    }

    path.node.args = path.node.args.reduce((acc, arg) => {
      if (isInstruction(arg) === false) {
        return [...acc, arg];
      }

      path.insertBefore(arg);
      didFlatten = true;

      return acc;
    }, []);
  }

  let didFlatten = true;

  while (didFlatten) {
    didFlatten = false;

    traverse(ast, {
      CallInstruction,
      Instr
    });
  }

  return ast;
}
