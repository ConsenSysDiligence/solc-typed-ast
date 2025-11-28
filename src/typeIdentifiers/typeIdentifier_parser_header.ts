import * as ast from "./ast";
// @ts-ignore
import { assert } from "../misc";

export function parseTypeIdentifier(contents: string): ast.TypeIdentifier {
    // @ts-ignore
    return parse(contents);
}
