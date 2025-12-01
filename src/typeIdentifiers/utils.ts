import { Expression, TypeName, VariableDeclaration } from "../ast";
import { assert } from "../misc";
import { TypeIdentifier } from "./ast";
import { parseTypeIdentifier } from "./typeIdentifier_parser_gen";

const cache = new Map<string, TypeIdentifier>();

export function typeOf(nd: Expression | VariableDeclaration | TypeName): TypeIdentifier {
    assert(nd.typeIdentifier !== undefined, `Missing typeIdentifier in {0}`, nd);
    let cached = cache.get(nd.typeIdentifier);

    if (cached === undefined) {
        cached = parseTypeIdentifier(nd.typeIdentifier);
        cache.set(nd.typeIdentifier, cached);
    }

    return cached;
}
