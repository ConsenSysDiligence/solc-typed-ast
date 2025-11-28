import { PointerTypeId } from "./pointer";
import { TypeIdentifier } from "./type_identifier";

export class ArraySliceTypeId extends TypeIdentifier {
    constructor(public readonly toType: PointerTypeId) {
        super();
    }

    pp(): string {
        return `${this.toType.pp()}_slice`;
    }
}
