import { TypeIdentifier } from "./type_identifier";

export class ArrayTypeId extends TypeIdentifier {
    constructor(
        public readonly elT: TypeIdentifier,
        public readonly size?: bigint
    ) {
        super();
    }

    pp(): string {
        return `t_array$_${this.elT.pp()}_$${this.size === undefined ? `dyn` : this.size}`;
    }
}
