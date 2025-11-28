import { BaseUserDefinedTypeIdentifier } from "./base_user_defined_type";

export class ContractTypeId extends BaseUserDefinedTypeIdentifier {
    constructor(name: string, id: number) {
        super("contract", name, id);
    }
}
