import { PackedArrayTypeId } from "./packed_array";

export class BytesTypeId extends PackedArrayTypeId {
    constructor() {
        super("bytes");
    }
}
