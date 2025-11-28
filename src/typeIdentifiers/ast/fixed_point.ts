import { TypeIdentifier } from "./type_identifier";

export class FixedPointTypeId extends TypeIdentifier {
    constructor(
        public readonly numBits: number,
        public readonly fractionalDigits: number,
        public readonly isSigned: boolean
    ) {
        super();
    }

    pp(): string {
        return `t_${this.isSigned ? "" : "u"}fixed${this.numBits}x${this.fractionalDigits}`;
    }
}
