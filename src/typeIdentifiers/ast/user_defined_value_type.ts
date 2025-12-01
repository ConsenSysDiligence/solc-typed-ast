import { BaseUserDefinedTypeId } from "./base_user_defined_type";

export class UserDefinedValueTypeId extends BaseUserDefinedTypeId {
    constructor(
        public readonly name: string,
        public readonly id: number
    ) {
        super("userDefinedValueType", name, id);
    }
}
