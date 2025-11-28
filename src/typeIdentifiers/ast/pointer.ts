import { DataLocation } from "../../ast";
import { TypeIdentifier } from "./type_identifier";

export class PointerTypeId extends TypeIdentifier {
    constructor(
        public readonly toType: TypeIdentifier,
        public readonly location: DataLocation,
        public readonly isPointer: boolean
    ) {
        super();
    }

    pp(): string {
        return `${this.toType.pp()}_${this.location}${this.isPointer ? "_ptr" : ""}`;
    }
}
