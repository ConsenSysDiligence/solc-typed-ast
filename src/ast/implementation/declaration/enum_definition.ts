import { enumToIntType } from "../../..";
import { ASTNodeWithChildren } from "../../ast_node";
import { SourceUnit } from "../meta/source_unit";
import { ContractDefinition } from "./contract_definition";
import { EnumValue } from "./enum_value";

export class EnumDefinition extends ASTNodeWithChildren<EnumValue> {
    /**
     * The name of the enum
     */
    name: string;

    /**
     * The source range for name string
     */
    nameLocation?: string;

    /**
     * Canonical name (or qualified name), e.g. `DefiningContract.SomeEnum`
     */
    canonicalName: string;

    constructor(
        id: number,
        src: string,
        type: string,
        name: string,
        canonicalName: string,
        members: Iterable<EnumValue>,
        nameLocation?: string,
        raw?: any
    ) {
        super(id, src, type, raw);

        this.name = name;
        this.canonicalName = canonicalName;

        for (const member of members) {
            this.appendChild(member);
        }

        this.nameLocation = nameLocation;
    }

    /**
     * Array of the enum values
     */
    get vMembers(): EnumValue[] {
        return this.ownChildren as EnumValue[];
    }

    /**
     * Reference to a scoped contract or source unit
     */
    get vScope(): ContractDefinition | SourceUnit {
        return this.parent as ContractDefinition | SourceUnit;
    }

    toUintTypeString(): string {
        return enumToIntType(this).pp();
    }
}
