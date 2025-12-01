import { PackedArrayTypeId } from "./packed_array";

export class StringTypeId extends PackedArrayTypeId {
    constructor() {
        super("string");
    }
}
