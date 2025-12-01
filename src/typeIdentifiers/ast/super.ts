import { BaseUserDefinedTypeId } from "./base_user_defined_type";

export class SuperTypeId extends BaseUserDefinedTypeId {
    constructor(
        public readonly name: string,
        public readonly id: number
    ) {
        super("super", name, id);
    }
}
