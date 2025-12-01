import { TypeIdentifier } from "./type_identifier";

export class IntTypeId extends TypeIdentifier {
    constructor(
        public readonly numBits: number,
        public readonly isSigned: boolean
    ) {
        super();
    }

    pp(): string {
        return `t_${this.isSigned ? "" : "u"}int${this.numBits}`;
    }
}
