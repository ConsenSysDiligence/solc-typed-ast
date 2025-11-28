import { TypeIdentifier } from "./type_identifier";
import { ppTypeIdentifierList } from "./utils";

export class TupleTypeId extends TypeIdentifier {
    constructor(public readonly components: Array<TypeIdentifier | null>) {
        super();
    }

    pp(): string {
        return `t_tuple${ppTypeIdentifierList(this.components)}`;
    }
}
