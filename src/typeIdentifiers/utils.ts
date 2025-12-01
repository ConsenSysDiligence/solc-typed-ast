import { Expression, TypeName, VariableDeclaration } from "../ast";
import { assert } from "../misc";
import { TypeIdentifier } from "./ast";
import { parseTypeIdentifier } from "./typeIdentifier_parser_gen";

const cache = new Map<string, TypeIdentifier>();

/**
 * Return the parsed `TypeIdentifier` for the given node.
 */
export function typeOf(nd: Expression | VariableDeclaration | TypeName): TypeIdentifier {
    assert(nd.typeIdentifier !== undefined, `Missing typeIdentifier in {0}`, nd);
    let cached = cache.get(nd.typeIdentifier);

    /**
     * Note: Its safe to cache `TypeIdentifier`s based on their string, since
     * 1) `TypeIdentifier`s don't hold a reference to any `ASTNode`s
     * 2) The typeIdentifier string completely determines the resulting
     * `TypeIdentifier`.
     */
    if (cached === undefined) {
        cached = parseTypeIdentifier(nd.typeIdentifier);
        cache.set(nd.typeIdentifier, cached);
    }

    return cached;
}
