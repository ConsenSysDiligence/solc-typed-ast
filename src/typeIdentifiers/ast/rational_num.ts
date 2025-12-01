import { assert } from "../../misc";
import { TypeIdentifier } from "./type_identifier";
import { bigintAbs } from "./utils";

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
