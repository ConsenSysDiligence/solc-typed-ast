import { TypeIdentifier } from "./type_identifier";

export abstract class PackedArrayTypeId extends TypeIdentifier {
    constructor(public readonly type: "string" | "bytes") {
        super();
    }

    pp(): string {
        return `t_${this.type}`;
    }
}
