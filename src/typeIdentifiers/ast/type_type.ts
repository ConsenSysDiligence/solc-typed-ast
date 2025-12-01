import { TypeIdentifier } from "./type_identifier";
import { ppTypeIdentifierList } from "./utils";

/**
 * The type of nodes corresponding to a type. e.g. the `T` in new T(...), or the `Ts` in `abi.decode(bytes, Ts)`
 */
export class TypeTypeId extends TypeIdentifier {
    constructor(public readonly actualT: TypeIdentifier) {
        super();
    }

    pp(): string {
        return `t_type${ppTypeIdentifierList([this.actualT])}`;
    }
}
