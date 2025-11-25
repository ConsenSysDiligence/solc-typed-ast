import { ASTNode } from "../../ast_node";

export class TypeName extends ASTNode {
    /**
     * Type string, e.g. `uint256`
     */
    typeString: string;

    /**
     * Type identifier, e.g. `t_uint256`
     * May be undefined for legacy ASTs
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

export type TypeNameConstructor<T extends TypeName> = new (
    id: number,
    src: string,
    typeString: string,
    typeIdentifier: string | undefined,
    ...args: any[]
) => T;
