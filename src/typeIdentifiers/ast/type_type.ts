import { TypeIdentifier } from "./type_identifier";
import { ppTypeIdentifierList } from "./utils";

export class TypeTypeId extends TypeIdentifier {
    constructor(public readonly actualT: TypeIdentifier) {
        super();
    }

    pp(): string {
        return `t_type${ppTypeIdentifierList([this.actualT])}`;
    }
}
