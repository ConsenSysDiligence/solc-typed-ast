import { BaseUserDefinedTypeIdentifier } from "./base_user_defined_type";

export class EnumTypeId extends BaseUserDefinedTypeIdentifier {
    constructor(
        public readonly name: string,
        public readonly id: number
    ) {
        super("enum", name, id);
    }
}
