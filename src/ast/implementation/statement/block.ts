import { StructuredDocumentation } from "../meta";
import { Statement, StatementWithChildren } from "./statement";

/**
 * Block is a compound statement and it can hold other statements
 */
export class Block extends StatementWithChildren<Statement> {
    constructor(
        id: number,
        src: string,
        type: string,
        statements: Iterable<Statement>,
        documentation?: string | StructuredDocumentation,
        raw?: any
    ) {
        super(id, src, type, documentation, raw);

        for (const statement of statements) {
            this.appendChild(statement);
        }
    }

    /**
     * An array of the member statements
     */
    get vStatements(): Statement[] {
        return this.ownChildren as Statement[];
    }
}
