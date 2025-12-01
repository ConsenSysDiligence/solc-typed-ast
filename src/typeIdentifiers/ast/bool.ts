import { TypeIdentifier } from "./type_identifier";

export class BoolTypeId extends TypeIdentifier {
    pp(): string {
        return "t_bool";
    }
}
