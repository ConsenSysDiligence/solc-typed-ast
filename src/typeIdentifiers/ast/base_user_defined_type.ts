import { TypeIdentifier } from "./type_identifier";

export abstract class BaseUserDefinedTypeId extends TypeIdentifier {
    constructor(
        public readonly kind: string,
        public readonly name: string,
        public readonly id: number
    ) {
        super();
    }

    pp(): string {
        return `t_${this.kind}$_${this.name.replaceAll("$", "$$$$$$")}_$${this.id}`;
    }
}
