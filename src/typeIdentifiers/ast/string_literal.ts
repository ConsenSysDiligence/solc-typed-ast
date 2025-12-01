import { TypeIdentifier } from "./type_identifier";

export class StringLiteralTypeId extends TypeIdentifier {
    constructor(public readonly hash: string) {
        super();
    }

    pp(): string {
        return `t_stringliteral_${this.hash}`;
    }
}
