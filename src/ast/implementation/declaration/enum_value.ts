import { ASTNodeWithChildren } from "../../ast_node";
import { getDocumentation, setDocumentation, WithPrecedingDocs } from "../../documentation";
import { StructuredDocumentation } from "../meta";

export class EnumValue
    extends ASTNodeWithChildren<StructuredDocumentation>
    implements WithPrecedingDocs
{
    /**
     * Storage field for string documentation.
     * This field is used when documentation is set as a string.
     */
    docString?: string;

    /**
     * Member value
     */
    name: string;

    /**
     * The source range for name string
     */
    nameLocation?: string;

    constructor(
        id: number,
        src: string,
        name: string,
        documentation?: string | StructuredDocumentation,
        nameLocation?: string,
        raw?: any
    ) {
        super(id, src, raw);

        this.name = name;
        this.documentation = documentation;
        this.nameLocation = nameLocation;
    }

    /**
     * Optional documentation appearing above the enum value:
     * - Is `undefined` when not specified.
     * - Is type of `string` when specified and compiler version is older than `0.8.30`.
     * - Is instance of `StructuredDocumentation` when specified and compiler version is `0.8.30` or newer.
     */
    get documentation(): string | StructuredDocumentation | undefined {
        return getDocumentation(this);
    }

    set documentation(value: string | StructuredDocumentation | undefined) {
        setDocumentation(this, value);
    }
}
