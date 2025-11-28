import { TypeIdentifier } from "./type_identifier";

export class FixedBytesTypeId extends TypeIdentifier {
    constructor(public readonly numBytes: number) {
        super();
    }

    pp(): string {
        return `t_bytes${this.numBytes}`;
    }
}
