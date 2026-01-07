import {
    ArrayTypeName,
    DataLocation,
    Expression,
    Mapping,
    StructDefinition,
    TypeName,
    VariableDeclaration
} from "../ast";
import { assert } from "../misc";
import { toABIType } from "./abi";
import {
    ArraySliceTypeId,
    ArrayTypeId,
    BytesTypeId,
    MappingTypeId,
    PointerTypeId,
    StringTypeId,
    StructTypeId,
    TupleTypeId,
    TypeIdentifier
} from "./ast";
import { uint256T } from "./constants";
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

    const solT = changeLocationTo(typeOf(type), DataLocation.Memory);
    let retTs: TypeIdentifier[];

    if (solT instanceof PointerTypeId && solT.toType instanceof StructTypeId) {
        const def = ctx.locate(solT.toType.id) as StructDefinition;
        // Filter out top-level arrays and maps
        retTs = def.vMembers
            .map((decl) => changeLocationTo(typeOf(decl), DataLocation.Memory))
            .filter(
                (t) =>
                    !(
                        (t instanceof PointerTypeId && t.toType instanceof ArrayTypeId) ||
                        t instanceof MappingTypeId
                    )
            )
            .map((t) => toABIType(t, ctx));
    } else {
        retTs = [toABIType(solT, ctx)];
    }

    const retType = retTs.length === 1 ? retTs[0] : new TupleTypeId(retTs);

    return [argTypes, retType];
}

/**
 * Given a `TypeIdentifier` `t` return a new generalized `TypeIdentifier` with all pointers removed (i.e. no specifications for locations)
 * @param t
 * @param loc
 * @returns
 */
export function generalize(t: TypeIdentifier): TypeIdentifier {
    if (t instanceof PointerTypeId) {
        return generalize(t.toType);
    }

    if (t instanceof ArrayTypeId) {
        return new ArrayTypeId(generalize(t.elT), t.size);
    }

    if (t instanceof ArraySliceTypeId || t instanceof MappingTypeId) {
        throw new Error(`Cannot generalize ${t.pp()}`);
    }

    if (t instanceof TupleTypeId) {
        return new TupleTypeId(t.components.map((c) => (c === null ? c : generalize(c))));
    }

    return t;
}

/**
 * Given an already generalized `TypeIdentifier` `t` and a location return a new
 * specialized `TypeIdentifier` with all reference types wrapped in a pointer to
 * the given location
 * @param t
 * @param loc
 * @returns
 */
export function specialize(t: TypeIdentifier, loc: DataLocation): TypeIdentifier {
    if (t instanceof ArraySliceTypeId || t instanceof PointerTypeId || t instanceof MappingTypeId) {
        throw new Error(`Cannot specialize ${t.pp()}`);
    }

    if (t instanceof ArrayTypeId) {
        return new PointerTypeId(new ArrayTypeId(specialize(t.elT, loc), t.size), loc, true);
    }

    if (t instanceof BytesTypeId || t instanceof StringTypeId) {
        return new PointerTypeId(t, loc, true);
    }

    if (t instanceof TupleTypeId) {
        return new TupleTypeId(t.components.map((c) => (c === null ? c : specialize(c, loc))));
    }

    return t;
}

/**
 * Return true IFF the `TypeIdentifier` `t` must live in storage.
 * @param t
 * @returns
 */
export function isTypeInStorage(t: TypeIdentifier): boolean {
    return (
        t instanceof MappingTypeId ||
        (t instanceof PointerTypeId && t.location === DataLocation.Storage)
    );
}
