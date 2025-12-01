import { TypeIdentifier } from "./type_identifier";
export type BuiltinStructKind = "block" | "message" | "transaction" | "abi";

export class BuiltinStructTypeId extends TypeIdentifier {
    constructor(public readonly kind: BuiltinStructKind) {
        super();
    }

    pp(): string {
        return `t_magic_${this.kind}`;
    }
}
