import { TypeIdentifier } from "./type_identifier";

export class AddressTypeId extends TypeIdentifier {
    constructor(public readonly payable: boolean) {
        super();
    }

    pp(): string {
        return this.payable ? "t_address_payable" : "t_address";
    }
}
