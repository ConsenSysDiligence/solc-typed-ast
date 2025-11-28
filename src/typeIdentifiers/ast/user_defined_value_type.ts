import { BaseUserDefinedTypeIdentifier } from "./base_user_defined_type";

export class UserDefinedValueTypeId extends BaseUserDefinedTypeIdentifier {
    constructor(
        public readonly name: string,
        public readonly id: number
    ) {
        super("userDefinedValueType", name, id);
    }
}
