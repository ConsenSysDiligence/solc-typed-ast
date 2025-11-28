import { TypeIdentifier } from "./type_identifier";

export function ppTypeIdentifierList(ts: Array<TypeIdentifier | null>): string {
    return `$_${ts.map((t) => (t === null ? "" : t.pp())).join("_$_")}_$`;
}
