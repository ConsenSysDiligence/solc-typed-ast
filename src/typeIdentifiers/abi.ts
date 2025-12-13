import {
    ASTContext,
    DataLocation,
    UserDefinedValueTypeDefinition,
    EnumDefinition,
    StructDefinition
} from "../ast";
import { assert, repeat } from "../misc";
import {
    TypeIdentifier,
    AddressTypeId,
    BoolTypeId,
    BytesTypeId,
    StringTypeId,
    FixedBytesTypeId,
    IntTypeId,
    PointerTypeId,
    ArrayTypeId,
    TupleTypeId,
    UserDefinedValueTypeId,
    ContractTypeId,
    EnumTypeId,
    StructTypeId,
    MappingTypeId,
    FunctionTypeId
} from "./ast";
import { addressT, uint256T, bytes24T } from "./constants";
import { typeOf, changeLocationTo, isTypeInStorage } from "./utils";

/**
 * Return the int typeIdentifier corresponding to a given Enum
 * @param decl
 * @returns
 */
export function enumToIntTypeId(decl: EnumDefinition): IntTypeId {
    const length = decl.children.length;

    let size: number | undefined;

    for (let n = 8; n <= 32; n += 8) {
        if (length <= 2 ** n) {
            size = n;

            break;
        }
    }

    assert(
        size !== undefined,
        "Unable to detect enum type size - member count exceeds 2 ** 32",
        decl
    );

    return new IntTypeId(size, false);
}

/**
 * Given an function argument's `TypeIdentifier` `from`, return the
 * `TypeIdentifier` that this argument would be encoded as in calldata.
 * @param from
 */
export function toABIType(from: TypeIdentifier, ctx: ASTContext): TypeIdentifier {
    if (from instanceof AddressTypeId) {
        // normalize payable -> address
        return addressT;
    }

    // Simple case - these are passed unchanged
    if (
        from instanceof BoolTypeId ||
        from instanceof BytesTypeId ||
        from instanceof StringTypeId ||
        from instanceof FixedBytesTypeId ||
        from instanceof IntTypeId
    ) {
        return from;
    }

    if (isTypeInStorage(from)) {
        return uint256T;
    }

    if (from instanceof PointerTypeId) {
        assert(from.location !== DataLocation.Storage, `Unexpected pointer {0}`, from);

        return toABIType(from.toType, ctx);
    }

    // Size arrays are passed as tuples, unsized arrays as arrays
    if (from instanceof ArrayTypeId) {
        const elT = toABIType(from.elT, ctx);
        return from.size === undefined
            ? new ArrayTypeId(elT, from.size)
            : new TupleTypeId(repeat(elT, Number(from.size)));
    }

    if (from instanceof UserDefinedValueTypeId) {
        const def = ctx.requireType(from.id, UserDefinedValueTypeDefinition);
        const innerT = typeOf(def.underlyingType);
        return toABIType(innerT, ctx);
    }

    // Contracts are passed as addresses
    if (from instanceof ContractTypeId) {
        return addressT;
    }

    // Enums are passed as the smallest number that fits
    if (from instanceof EnumTypeId) {
        const def = ctx.requireType(from.id, EnumDefinition);
        return enumToIntTypeId(def);
    }

    // Structs are passed as tuples
    if (from instanceof StructTypeId) {
        const def = ctx.requireType(from.id, StructDefinition);
        let fieldTs = def.vMembers.map((decl) => typeOf(decl));
        // Remove any mappings
        fieldTs = fieldTs.filter((fieldT) => !(fieldT instanceof MappingTypeId));

        // Convert the fields to ABI types and filter out any empty tuples.
        // Empty tuples can result if a field is a struct contains only mappings.
        // Also note that struct fields have "storage" as a default location.
        // Convert to Memory to avoid treating them as storage pointers.
        const abiFieldTs = fieldTs
            .map((fieldT) => toABIType(changeLocationTo(fieldT, DataLocation.Memory), ctx))
            .filter(
                (abiFieldT) =>
                    !(abiFieldT instanceof TupleTypeId && abiFieldT.components.length === 0)
            );

        return new TupleTypeId(abiFieldTs);
    }

    if (from instanceof FunctionTypeId && from.kind === "external") {
        return bytes24T;
    }

    assert(false, `Cannot abi encode type ${from.pp()}`);
}
