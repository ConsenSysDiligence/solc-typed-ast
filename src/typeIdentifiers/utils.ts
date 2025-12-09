import {
    ArrayTypeName,
    ASTContext,
    DataLocation,
    EnumDefinition,
    Expression,
    Mapping,
    StructDefinition,
    TypeName,
    UserDefinedValueTypeDefinition,
    VariableDeclaration
} from "../ast";
import { assert, repeat } from "../misc";
import {
    AddressTypeId,
    ArraySliceTypeId,
    ArrayTypeId,
    BoolTypeId,
    BytesTypeId,
    ContractTypeId,
    EnumTypeId,
    FixedBytesTypeId,
    FunctionTypeId,
    IntTypeId,
    MappingTypeId,
    PointerTypeId,
    StringTypeId,
    StructTypeId,
    TupleTypeId,
    TypeIdentifier,
    UserDefinedValueTypeId
} from "./ast";
import { addressT, bytes24T, uint256T } from "./constants";
import { parseTypeIdentifier } from "./typeIdentifier_parser_gen";

const cache = new Map<string, TypeIdentifier>();

/**
 * Return the parsed `TypeIdentifier` for the given node.
 */
export function typeOf(nd: Expression | VariableDeclaration | TypeName): TypeIdentifier {
    assert(nd.typeIdentifier !== undefined, `Missing typeIdentifier in {0}`, nd);
    let cached = cache.get(nd.typeIdentifier);

    /**
     * Note: Its safe to cache `TypeIdentifier`s based on their string, since
     * 1) `TypeIdentifier`s don't hold a reference to any `ASTNode`s
     * 2) The typeIdentifier string completely determines the resulting
     * `TypeIdentifier`.
     */
    if (cached === undefined) {
        cached = parseTypeIdentifier(nd.typeIdentifier);
        cache.set(nd.typeIdentifier, cached);
    }

    return cached;
}

/**
 * Given a `TypeIdentifier` `t` return a new `TypeIdentifier` with all pointer locations changed to `loc`.
 * @param t
 * @param loc
 * @returns
 */
export function changeLocationTo(t: TypeIdentifier, loc: DataLocation): TypeIdentifier {
    if (t instanceof PointerTypeId) {
        return new PointerTypeId(changeLocationTo(t.toType, loc), loc, t.isPointer);
    }

    if (t instanceof ArrayTypeId) {
        return new ArrayTypeId(changeLocationTo(t.elT, loc), t.size);
    }

    if (t instanceof ArraySliceTypeId) {
        return new ArraySliceTypeId(changeLocationTo(t.toType, loc) as PointerTypeId);
    }

    if (t instanceof MappingTypeId) {
        return new MappingTypeId(
            changeLocationTo(t.keyType, loc),
            changeLocationTo(t.valueType, loc)
        );
    }

    if (t instanceof TupleTypeId) {
        return new TupleTypeId(
            t.components.map((c) => (c === null ? c : changeLocationTo(c, loc)))
        );
    }

    return t;
}

/**
 * Given a public state variable declaration `v` return the ABI types of the arguments and the returns for this var.
 * This will account for:
 *  - indexing into arrays/maps
 *  - converting returned structs to tuples
 *  - omitting arrays and maps
 *
 * @param t
 * @param loc
 * @returns
 */
export function getterArgsAndReturn(v: VariableDeclaration): [TypeIdentifier[], TypeIdentifier] {
    const argTypes: TypeIdentifier[] = [];
    const ctx = v.requiredContext;

    let type = v.vType;

    assert(
        type !== undefined,
        "Called getterArgsAndReturn() on variable declaration without type",
        v
    );

    while (true) {
        if (type instanceof ArrayTypeName) {
            argTypes.push(uint256T);

            type = type.vBaseType;
        } else if (type instanceof Mapping) {
            // Make sure to change default storage pointer location for string/bytes to Memory as to not
            // confuse `toABIType`.
            argTypes.push(
                toABIType(changeLocationTo(typeOf(type.vKeyType), DataLocation.Memory), ctx)
            );

            type = type.vValueType;
        } else {
            break;
        }
    }

    let retType = toABIType(changeLocationTo(typeOf(type), DataLocation.Memory), ctx);

    // Filter out top-level arrays. Maps are already filtered by toABIType
    if (retType instanceof TupleTypeId) {
        const filteredComps = retType.components.filter((compT) => !(compT instanceof ArrayTypeId));

        // For top-level tuples remove any arrays from the tuple
        retType = filteredComps.length === 1 ? filteredComps[0] : new TupleTypeId(filteredComps);
    }

    return [argTypes, retType];
}

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
 * Given a `TypeIdentifier` `from` return the ABI type that corresponds to
 * `from`. Note that there are no pointers in ABI types - instead the 3 dynamic
 * types - bytes, strings and unsized arrays appear generalized.
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

    if (from instanceof PointerTypeId) {
        // Storage pointers in delegate calls are passed as numbers
        if (from.location === DataLocation.Storage) {
            return uint256T;
        }

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
