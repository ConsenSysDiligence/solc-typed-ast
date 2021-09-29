import expect from "expect";
import { ASTNode, ASTNodeConstructor } from "../../../src";

export function verify<T extends ASTNode>(
    node: T,
    type: ASTNodeConstructor<T>,
    properties: Partial<T>
): void {
    expect(node).toBeInstanceOf(type);

    for (const p in properties) {
        expect(node[p]).toEqual(properties[p]);
    }
}
