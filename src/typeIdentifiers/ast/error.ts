import { TypeIdentifier } from "./type_identifier";

/**
 * Type of CustomError(...) in `require(cond, CustomError(...)).
 * Note that this is different from the type of the identifier `CustomError` itself
 */
export class ErrorTypeId extends TypeIdentifier {
    constructor() {
        super();
    }

    pp(): string {
        return `t_error`;
    }
}
