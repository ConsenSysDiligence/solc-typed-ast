import { TypeIdentifier } from "./type_identifier";
import { ppTypeIdentifierList } from "./utils";

export class MappingTypeId extends TypeIdentifier {
    constructor(
        public readonly keyType: TypeIdentifier,
        public readonly valueType: TypeIdentifier
    ) {
        super();
    }

    pp(): string {
        return `t_mapping${ppTypeIdentifierList([this.keyType, this.valueType])}`;
    }
}
