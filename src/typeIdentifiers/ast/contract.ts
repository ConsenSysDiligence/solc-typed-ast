import { BaseUserDefinedTypeId } from "./base_user_defined_type";

export class ContractTypeId extends BaseUserDefinedTypeId {
    constructor(name: string, id: number) {
        super("contract", name, id);
    }
}
