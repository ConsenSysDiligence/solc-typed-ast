import { TypeIdentifier } from "./type_identifier";

export class ModuleTypeId extends TypeIdentifier {
    constructor(public readonly sourceUnitId: number) {
        super();
    }

    pp(): string {
        return `t_module_${this.sourceUnitId}`;
    }
}
