import { Expression, TypeName, VariableDeclaration } from "../ast";
import { assert } from "../misc";
import { TypeIdentifier } from "./ast";
import { parseTypeIdentifier } from "./typeIdentifier_parser_gen";

export function typeOf(nd: Expression | VariableDeclaration | TypeName): TypeIdentifier {
    assert(nd.typeIdentifier !== undefined, `Missing typeIdentifier in {0}`, nd);
    return parseTypeIdentifier(nd.typeIdentifier);
}
