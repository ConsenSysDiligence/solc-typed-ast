import { TypeIdentifier } from "./type_identifier";

/**
 * Type of type(T) (as in type(int256)).
 */
export class MetaTypeTypeId extends TypeIdentifier {
    constructor(public readonly innerT: TypeIdentifier) {
        super();
    }

    pp(): string {
        return `t_magic_meta_type_${this.innerT.pp()}`;
    }
}
