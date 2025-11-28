import { Expression, VariableDeclaration } from "../ast";
import { TypeIdentifier } from "./ast";

export function typeOf(nd: Expression | VariableDeclaration): TypeIdentifier {
    throw new Error("NYI");
}
