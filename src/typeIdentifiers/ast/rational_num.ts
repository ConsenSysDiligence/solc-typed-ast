import { assert } from "../../misc";
import { bigintAbs } from "../../types";
import { TypeIdentifier } from "./type_identifier";

export class RationalNumTypeId extends TypeIdentifier {
    constructor(
        public readonly numerator: bigint,
        public readonly denominator: bigint
    ) {
        assert(denominator > 0n, ``);
        super();
    }

    pp(): string {
        return `t_rational${this.numerator < 0 ? "_minus" : ""}_${bigintAbs(this.numerator)}_by_${this.denominator}`;
    }
}
