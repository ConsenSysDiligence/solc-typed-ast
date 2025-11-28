import { ASTNode } from "../../ast_node";

export class Expression extends ASTNode {
    /**
     * Type string, e.g. `uint256`
     */
    typeString: string;
    /**
     * Raw type identifier, e.g. `t_uint256`.
     * Note that we leave it as potentially undefined since it may be missing on legacy ASTs
     * (Note @dimo we should really deprecate those to simplify the codebase)
     */
    typeIdentifier: string | undefined;

    constructor(
        id: number,
        src: string,
        typeString: string,
        typeIdentifier: string | undefined,
        raw?: any
    ) {
        super(id, src, raw);

        this.typeString = typeString;
        this.typeIdentifier = typeIdentifier;
    }
}

export type ExpressionConstructor<T extends Expression> = new (
    id: number,
    src: string,
    typeString: string,
    typeIdentifier: string | undefined,
    ...args: any[]
) => T;
