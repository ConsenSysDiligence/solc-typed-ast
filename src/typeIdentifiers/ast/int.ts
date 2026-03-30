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

    /// Maximum value (inclusive) representable by this int type.
    max(): bigint {
        return 2n ** BigInt(this.isSigned ? this.numBits - 1 : this.numBits) - 1n;
    }

    /// Minimum value (inclusive) representable by this int type.
    min(): bigint {
        return this.isSigned ? -(2n ** BigInt(this.numBits - 1)) : 0n;
    }

    fits(literal: bigint): boolean {
        return literal <= this.max() && literal >= this.min();
    }
}
