import { BaseUserDefinedTypeId } from "./base_user_defined_type";

export class StructTypeId extends BaseUserDefinedTypeId {
    constructor(
        public readonly name: string,
        public readonly id: number
    ) {
        super("struct", name, id);
    }
}
