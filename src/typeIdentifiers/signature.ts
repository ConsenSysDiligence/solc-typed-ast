import { utf8ToBytes } from "ethereum-cryptography/utils";
import {
    ASTContext,
    UserDefinedValueTypeDefinition,
    StructDefinition,
    DataLocation,
    EnumDefinition,
    ContractDefinition,
    FunctionDefinition,
    VariableDeclaration,
    EventDefinition,
    ErrorDefinition,
    ContractKind
} from "../ast";
import { assert } from "../misc";
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
    UserDefinedValueTypeId,
    ContractTypeId,
    EnumTypeId,
    StructTypeId,
    MappingTypeId,
    TupleTypeId,
    FunctionTypeId
} from "./ast";
import { addressT } from "./constants";
import { typeOf, changeLocationTo, getterArgsAndReturn, isTypeInStorage } from "./utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import { enumToIntTypeId } from "./abi";

/**
 * Given a function argument `TypeIdentifier` `from`, return the
 * `TypeIdentifier` as it should appear in the function signature.
 *
 * This differs from `toAbiType` in how it treats:
 *  - storage pointers
 *  - structs
 *  - functions types
 *
 * @param from
 */
function toSignatureType(
    from: TypeIdentifier,
    ctx: ASTContext,
    isLibrary: boolean
): TypeIdentifier {
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
        return toSignatureType(from.toType, ctx, isLibrary);
    }

    // Arrays appear just as arrays in signatures
    if (from instanceof ArrayTypeId) {
        const elT = toSignatureType(from.elT, ctx, isLibrary);
        return new ArrayTypeId(elT, from.size);
    }

    if (from instanceof UserDefinedValueTypeId) {
        const def = ctx.requireType(from.id, UserDefinedValueTypeDefinition);
        const innerT = typeOf(def.underlyingType);
        return toSignatureType(innerT, ctx, isLibrary);
    }

    // Contracts are passed as addresses for normal contracts, and by name for libraries
    if (from instanceof ContractTypeId) {
        return isLibrary ? from : addressT;
    }

    if (from instanceof EnumTypeId) {
        if (isLibrary) {
            return from;
        }

        const def = ctx.requireType(from.id, EnumDefinition);

        return isLibrary ? from : enumToIntTypeId(def);
    }

    // Structs appear by name in library signatures, and as tuples in normal function signatures
    if (from instanceof StructTypeId) {
        if (isLibrary) {
            return from;
        }

        const def = ctx.requireType(from.id, StructDefinition);
        let fieldTs = def.vMembers.map((decl) => typeOf(decl));
        // Remove any mappings
        fieldTs = fieldTs.filter((fieldT) => !(fieldT instanceof MappingTypeId));

        // Convert the fields to ABI signature types and filter out any empty tuples.
        // Empty tuples can result if a field is a struct contains only mappings.
        // Also note that struct fields have "storage" as a default location.
        // Convert to Memory to avoid treating them as storage pointers.
        const abiFieldTs = fieldTs
            .map((fieldT) =>
                toSignatureType(changeLocationTo(fieldT, DataLocation.Memory), ctx, isLibrary)
            )
            .filter(
                (abiFieldT) =>
                    !(abiFieldT instanceof TupleTypeId && abiFieldT.components.length === 0)
            );

        return new TupleTypeId(abiFieldTs);
    }

    if (from instanceof FunctionTypeId && from.kind === "external") {
        return from;
    }

    if (from instanceof MappingTypeId) {
        return new MappingTypeId(
            toSignatureType(changeLocationTo(from.keyType, DataLocation.Memory), ctx, isLibrary),
            toSignatureType(changeLocationTo(from.valueType, DataLocation.Memory), ctx, isLibrary)
        );
    }

    assert(false, `Cannot abi encode type ${from.pp()}`);
}

function scopedName(n: StructDefinition | EnumDefinition | ContractDefinition): string {
    const scope = n.vScope;

    return scope instanceof ContractDefinition ? `${scope.name}.${n.name}` : n.name;
}

function abiTypeIdToCanonicalName(t: TypeIdentifier, ctx: ASTContext): string {
    if (
        t instanceof IntTypeId ||
        t instanceof FixedBytesTypeId ||
        t instanceof BoolTypeId ||
        t instanceof BytesTypeId ||
        t instanceof StringTypeId
    ) {
        // Skip the t_
        return t.pp().slice(2);
    }

    // Payable is ignored in canonical names
    if (t instanceof AddressTypeId) {
        return "address";
    }

    if (t instanceof ArrayTypeId) {
        return `${abiTypeIdToCanonicalName(t.elT, ctx)}[${t.size ? t.size.toString(10) : ""}]`;
    }

    if (t instanceof TupleTypeId) {
        return `(${t.components.map((compT) => abiTypeIdToCanonicalName(compT, ctx)).join(",")})`;
    }

    if (t instanceof FunctionTypeId) {
        return "function";
    }

    if (t instanceof MappingTypeId) {
        return `mapping(${abiTypeIdToCanonicalName(t.keyType, ctx)} => ${abiTypeIdToCanonicalName(t.valueType, ctx)})`;
    }

    if (t instanceof StructTypeId) {
        return scopedName(ctx.requireType(t.id, StructDefinition));
    }

    if (t instanceof ContractTypeId) {
        return scopedName(ctx.requireType(t.id, ContractDefinition));
    }

    if (t instanceof EnumTypeId) {
        return scopedName(ctx.requireType(t.id, EnumDefinition));
    }

    assert(false, "Unexpected ABI Type: {0}", t);
}

export function signature(
    nd: FunctionDefinition | VariableDeclaration | EventDefinition | ErrorDefinition
): string {
    const ctx = nd.requiredContext;
    let argTs: TypeIdentifier[];

    if (
        nd instanceof FunctionDefinition ||
        nd instanceof EventDefinition ||
        nd instanceof ErrorDefinition
    ) {
        argTs = nd.vParameters.vParameters.map(typeOf);
    } else {
        [argTs] = getterArgsAndReturn(nd);
    }

    const isLibFun =
        nd instanceof FunctionDefinition &&
        nd.vScope instanceof ContractDefinition &&
        nd.vScope.kind === ContractKind.Library;

    const argSigTs: Array<[TypeIdentifier, boolean]> = argTs.map((t) => [
        toSignatureType(t, ctx, isLibFun),
        isTypeInStorage(t)
    ]);

    return `${nd.name}(${argSigTs
        .map(([t, isStorage]) => {
            const tName = abiTypeIdToCanonicalName(t, ctx);
            return isStorage ? `${tName} storage` : tName;
        })
        .join(",")})`;
}

export function signatureHash(
    nd: FunctionDefinition | VariableDeclaration | EventDefinition | ErrorDefinition
): Uint8Array {
    const sig = signature(nd);

    return keccak256(utf8ToBytes(sig)).slice(0, 4);
}
