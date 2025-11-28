import { TypeIdentifier } from "./type_identifier";
import { ppTypeIdentifierList } from "./utils";

export class ModifierTypeId extends TypeIdentifier {
    constructor(public readonly parameters: TypeIdentifier[]) {
        super();
    }

    pp(): string {
        return `t_modifier${ppTypeIdentifierList(this.parameters)}`;
    }
}
