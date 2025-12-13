import expect from "expect";
import fse from "fs-extra";
import { join } from "path";
import { lt } from "semver";
import {
    AddressTypeId,
    ArrayTypeId,
    assert,
    ASTKind,
    ASTReader,
    BoolTypeId,
    BytesTypeId,
    CompileResult,
    CompilerKind,
    CompilerVersions,
    compileSol,
    ContractKind,
    detectCompileErrors,
    ErrorDefinition,
    EventDefinition,
    Expression,
    FixedBytesTypeId,
    FunctionDefinition,
    FunctionKind,
    FunctionVisibility,
    getterArgsAndReturn,
    Identifier,
    ImportDirective,
    IntTypeId,
    signature,
    signatureHash,
    SourceUnit,
    StateVariableVisibility,
    StringTypeId,
    toABIType,
    TupleTypeId,
    TypeIdentifier,
    TypeName,
    typeOf,
    VariableDeclaration
} from "../../../src";
import { isAbiConstructorFragment, isAbiFragment } from "web3-eth-abi";
import { AbiFragment, AbiParameter } from "web3-types";
import { bytesToHex } from "ethereum-cryptography/utils";

export const samples: Array<[string, any]> = [
    ["./test/samples/solidity/compile_04.sol", undefined],
    ["./test/samples/solidity/compile_05.sol", undefined],
    ["./test/samples/solidity/latest_06.sol", undefined],
    ["./test/samples/solidity/latest_07.sol", undefined],
    ["./test/samples/solidity/latest_08.sol", { viaIR: true }],
    ["./test/samples/solidity/resolving/resolving_08.sol", undefined],
    ["./test/samples/solidity/resolving/block_04.sol", undefined],
    ["./test/samples/solidity/resolving/block_05.sol", undefined],
    [
        "./test/samples/solidity/resolving/imports_and_source_unit_function_overloading.sol",
        undefined
    ],
    ["./test/samples/solidity/resolving/inheritance_and_shadowing.sol", undefined],
    //["./test/samples/solidity/resolving/shadowing_overloading_and_overriding.sol", undefined],
    ["./test/samples/solidity/resolving/simple_shadowing.sol", undefined],
    ["./test/samples/solidity/types/types.sol", undefined],
    /// Added with grep
    ["test/samples/solidity/struct_docs_05.sol", undefined],
    ["test/samples/solidity/node.sol", undefined],
    ["test/samples/solidity/declarations/interface_060.sol", undefined],
    ["test/samples/solidity/resolving/boo.sol", undefined],
    ["test/samples/solidity/resolving/struct_assignments.sol", undefined],
    ["test/samples/solidity/resolving/foo.sol", undefined],
    ["test/samples/solidity/resolving/id_paths.sol", undefined],
    ["test/samples/solidity/statements/do_while_0413.sol", undefined],
    ["test/samples/solidity/statements/expression_050.sol", undefined],
    ["test/samples/solidity/statements/while_0413.sol", undefined],
    ["test/samples/solidity/statements/placeholder_0413.sol", undefined],
    ["test/samples/solidity/statements/emit_0421.sol", undefined],
    ["test/samples/solidity/statements/variable_declaration_0413.sol", undefined],
    ["test/samples/solidity/statements/throw_0413.sol", undefined],
    ["test/samples/solidity/statements/while_050.sol", undefined],
    ["test/samples/solidity/statements/emit_050.sol", undefined],
    ["test/samples/solidity/statements/inline_assembly_050.sol", undefined],
    ["test/samples/solidity/statements/if_050.sol", undefined],
    ["test/samples/solidity/statements/expression_0413.sol", undefined],
    ["test/samples/solidity/statements/block_050.sol", undefined],
    ["test/samples/solidity/statements/for_050.sol", undefined],
    ["test/samples/solidity/statements/return_050.sol", undefined],
    ["test/samples/solidity/statements/placeholder_050.sol", undefined],
    ["test/samples/solidity/statements/inline_assembly_060.sol", undefined],
    ["test/samples/solidity/statements/for_0413.sol", undefined],
    ["test/samples/solidity/statements/inline_assembly_0413.sol", undefined],
    ["test/samples/solidity/statements/return_0413.sol", undefined],
    ["test/samples/solidity/statements/block_0413.sol", undefined],
    ["test/samples/solidity/statements/do_while_050.sol", undefined],
    ["test/samples/solidity/statements/variable_declaration_050.sol", undefined],
    ["test/samples/solidity/statements/if_0413.sol", undefined],
    ["test/samples/solidity/getters_08.sol", undefined],
    //["test/samples/solidity/dispatch_05.sol", undefined],
    ["test/samples/solidity/looks_same_075.sol", undefined],
    ["test/samples/solidity/compile_06.sol", undefined],
    ["test/samples/solidity/getters_07_abiv1.sol", undefined],
    ["test/samples/solidity/struct_docs_04.sol", undefined],
    ["test/samples/solidity/signatures.sol", undefined],
    ["test/samples/solidity/getters_07.sol", undefined],
    ["test/samples/solidity/source_map.sol", undefined],
    ["test/samples/solidity/latest_imports_08.sol", undefined],
    ["test/samples/solidity/issue_132_fun_kind.sol", undefined],
    ["test/samples/solidity/selectors.sol", undefined],
    ["test/samples/solidity/meta/complex_imports/c.sol", undefined],
    ["test/samples/solidity/meta/pragma.sol", undefined],
    ["test/samples/solidity/writer_edge_cases.sol", undefined],
    ["test/samples/solidity/reports/B.sol", undefined],
    ["test/samples/solidity/reports/A.sol", undefined],
    ["test/samples/solidity/looks_same_075.sourced.sm.sol", undefined],
    ["test/samples/solidity/expressions/conditional_050.sol", undefined],
    ["test/samples/solidity/expressions/conditional_0413.sol", undefined],
    ["test/samples/solidity/super.sol", undefined],
    ["test/samples/solidity/constant_expressions.sol", undefined],
    ["test/samples/solidity/decoding_test.sol", undefined],
    ["test/samples/solidity/ops.sol", undefined],
    ["test/samples/solidity/builtins_0426.sol", undefined],
    ["test/samples/solidity/builtins_0426.sol", undefined],
    ["test/samples/solidity/builtins_0816.sol", undefined],
    ["test/samples/solidity/different_abi_encoders/v1_imports_v2/v1.sol", undefined],
    ["test/samples/solidity/different_abi_encoders/v2_imports_v1/v2.sol", undefined],
    ["test/samples/solidity/type_inference/sample00.sol", undefined],
    ["test/samples/solidity/type_inference/sample01.sol", undefined],
    ["test/samples/solidity/type_inference/sample02.sol", undefined],
    ["test/samples/solidity/type_inference/sample03.sol", undefined],
    ["test/samples/solidity/user_defined_operators_0819.sol", undefined]
];

const ENV_CUSTOM_PATH = "SOLC_TEST_SAMPLES_PATH";

describe("typeIdentifier tests", () => {
    const path = process.env[ENV_CUSTOM_PATH];
    const sampleList =
        path !== undefined
            ? fse
                  .readdirSync(path)
                  .filter((name) => name.endsWith(".sol") || name.endsWith(".json"))
                  .map((name) => join(path, name))
            : samples;

    for (const [sample, compilerSettings] of sampleList) {
        describe(sample, () => {
            let result: CompileResult;
            let compilerVersion: string | undefined;
            let data: any;
            let sourceUnits: SourceUnit[];

            beforeAll(async () => {
                try {
                    if (sample.endsWith(".sol")) {
                        result = await compileSol(
                            sample,
                            "auto",
                            undefined,
                            undefined,
                            compilerSettings,
                            CompilerKind.Native
                        );
                        expect(result.compilerVersion).toBeDefined();

                        data = result.data;
                        compilerVersion = result.compilerVersion;
                    } else if (sample.endsWith(".json")) {
                        data = fse.readJSONSync(sample);
                        const fetchedCompilerVersions = sample.match(/\d+\.\d+\.\d+/);

                        assert(
                            fetchedCompilerVersions !== null &&
                                fetchedCompilerVersions.length === 1,
                            "Unable to fetch compiler version"
                        );

                        // Fix compiler version to lowest possible
                        compilerVersion = lt(fetchedCompilerVersions[0], CompilerVersions[0])
                            ? CompilerVersions[0]
                            : fetchedCompilerVersions[0];
                    }
                } catch {
                    console.error(`Failed compiling ${sample}`);
                    return;
                }

                const errors = detectCompileErrors(data);

                expect(errors).toHaveLength(0);

                assert(compilerVersion !== undefined, "Expected compiler version to be defined");

                const reader = new ASTReader();
                sourceUnits = reader.read(data, ASTKind.Modern);
            });

            it("All Expressions and VariableDeclaration(s) have a typeIdentifier", () => {
                for (const unit of sourceUnits) {
                    unit.walk((node) => {
                        if (
                            !(
                                node instanceof Expression ||
                                node instanceof TypeName ||
                                node instanceof VariableDeclaration
                            )
                        ) {
                            return;
                        }

                        if (node instanceof Identifier && node.parent instanceof ImportDirective) {
                            return;
                        }

                        expect(node.typeIdentifier !== undefined).toBeTruthy();
                    });
                }
            });

            it("We can parse the typeIdentifier", () => {
                for (const unit of sourceUnits) {
                    unit.walk((node) => {
                        if (
                            !(
                                node instanceof Expression ||
                                node instanceof TypeName ||
                                node instanceof VariableDeclaration
                            )
                        ) {
                            return;
                        }

                        // Identifiers under ImportDirectives don't have typeDescritions
                        if (node instanceof Identifier && node.parent instanceof ImportDirective) {
                            return;
                        }

                        expect(() => typeOf(node)).not.toThrow();
                    });
                }
            });

            it("We can parse the typeIdentifier", () => {
                if (!result.data.contracts) {
                    return;
                }

                for (const unit of sourceUnits) {
                    if (unit.vContracts.length === 0) {
                        continue;
                    }

                    expect(result.data.contracts[unit.sourceEntryKey]).toBeDefined();

                    const unitFragment = result.data.contracts[unit.sourceEntryKey];
                    for (const contract of unit.vContracts) {
                        // Libraries dont seem to have ABI fragments
                        if (contract.kind === ContractKind.Library) {
                            continue;
                        }

                        expect(unitFragment[contract.name]).toBeDefined();
                        const fragMap = getFragMap(getFragments(unitFragment[contract.name].abi));

                        for (const fun of contract.vFunctions) {
                            // Not part of the ABI
                            if (
                                fun.kind === FunctionKind.Fallback ||
                                fun.kind === FunctionKind.Receive
                            ) {
                                continue;
                            }

                            if (
                                !(
                                    fun.visibility === FunctionVisibility.External ||
                                    fun.visibility === FunctionVisibility.Public
                                )
                            ) {
                                continue;
                            }

                            const id = getId(fun);
                            const frag = fragMap.get(id) as AbiFragment;
                            expect(frag).toBeDefined();

                            const [argTs, retTs] = getArgsAndReturns(fun);
                            expect(compareTypeLists(argTs, frag.inputs)).toBeTruthy();
                            expect(compareTypeLists(retTs, (frag as any).outputs)).toBeTruthy();

                            if (fun.raw.functionSelector !== undefined) {
                                if (bytesToHex(signatureHash(fun)) !== fun.raw.functionSelector) {
                                    console.error(
                                        `Wrong selector for ${fun.name} with sig ${signature(fun)} in ${unit.sourceEntryKey}`
                                    );
                                }
                                expect(bytesToHex(signatureHash(fun))).toEqual(
                                    fun.raw.functionSelector
                                );
                            }
                        }

                        for (const v of contract.vStateVariables) {
                            if (v.visibility !== StateVariableVisibility.Public) {
                                continue;
                            }

                            const id = getId(v);
                            const frag = fragMap.get(id) as AbiFragment;
                            expect(frag).toBeDefined();

                            const [argTs, retTs] = getArgsAndReturns(v);
                            expect(compareTypeLists(argTs, frag.inputs)).toBeTruthy();
                            expect(compareTypeLists(retTs, (frag as any).outputs)).toBeTruthy();

                            if (v.raw.functionSelector !== undefined) {
                                if (bytesToHex(signatureHash(v)) !== v.raw.functionSelector) {
                                    console.error(
                                        `Wrong selector for state var ${v.name} with sig ${signature(v)} in ${unit.sourceEntryKey}`
                                    );
                                }
                                expect(bytesToHex(signatureHash(v))).toEqual(
                                    v.raw.functionSelector
                                );
                            }
                        }

                        for (const err of contract.vErrors) {
                            const id = getId(err);
                            const frag = fragMap.get(id) as AbiFragment;
                            expect(frag).toBeDefined();

                            const [argTs, retTs] = getArgsAndReturns(err);
                            expect(compareTypeLists(argTs, frag.inputs)).toBeTruthy();
                            expect(compareTypeLists(retTs, (frag as any).outputs)).toBeTruthy();

                            if (err.raw.errorSelector !== undefined) {
                                const expectedSelector = err.raw.errorSelector;

                                if (bytesToHex(signatureHash(err)) !== expectedSelector) {
                                    console.error(
                                        `Wrong selector for error ${err.name} with sig ${signature(err)} in ${unit.sourceEntryKey}`
                                    );
                                }
                                expect(bytesToHex(signatureHash(err))).toEqual(expectedSelector);
                            }
                        }

                        for (const evt of contract.vEvents) {
                            const id = getId(evt);
                            const frag = fragMap.get(id) as AbiFragment;
                            expect(frag).toBeDefined();

                            const [argTs, retTs] = getArgsAndReturns(evt);
                            expect(compareTypeLists(argTs, frag.inputs)).toBeTruthy();
                            expect(compareTypeLists(retTs, (frag as any).outputs)).toBeTruthy();

                            if (evt.raw.eventSelector !== undefined) {
                                const expectedSelector = evt.raw.eventSelector.slice(0, 8);

                                if (bytesToHex(signatureHash(evt)) !== expectedSelector) {
                                    console.error(
                                        `Wrong selector for event ${evt.name} with sig ${signature(evt)} in ${unit.sourceEntryKey}`
                                    );
                                }
                                expect(bytesToHex(signatureHash(evt))).toEqual(expectedSelector);
                            }
                        }
                    }
                }
            });
        });
    }
});

function getArgsAndReturns(
    nd: FunctionDefinition | VariableDeclaration | EventDefinition | ErrorDefinition
): [TypeIdentifier[], TypeIdentifier[]] {
    const ctx = nd.requiredContext;

    if (nd instanceof FunctionDefinition) {
        return [
            nd.vParameters.vParameters.map((p) => toABIType(typeOf(p), ctx)),
            nd.vReturnParameters.vParameters.map((p) => toABIType(typeOf(p), ctx))
        ];
    }

    if (nd instanceof VariableDeclaration) {
        const [argTs, retT] = getterArgsAndReturn(nd);

        return [argTs, retT instanceof TupleTypeId ? retT.components : [retT]];
    }

    return [nd.vParameters.vParameters.map((p) => toABIType(typeOf(p), ctx)), []];
}

function compareTypeLists(
    ts: TypeIdentifier[],
    frags: readonly AbiParameter[] | undefined
): boolean {
    frags = frags === undefined ? [] : frags;

    if (frags.length !== ts.length) {
        return false;
    }

    for (let i = 0; i < ts.length; i++) {
        if (!match(ts[i], frags[i])) {
            return false;
        }
    }

    return true;
}

const endArrRE = /\[([0-9]+)\]/;

function match(type: TypeIdentifier, frag: AbiParameter): boolean {
    const m = frag.type.match(endArrRE);
    if (m !== null && type instanceof TupleTypeId) {
        const expectedLen = Number(m[1]);
        if (expectedLen !== type.components.length) {
            return false;
        }

        const baseT = { ...frag, type: frag.type.slice(0, -m[0].length) };

        for (let i = 0; i < expectedLen; i++) {
            if (!match(type.components[i], baseT)) {
                return false;
            }
        }

        return true;
    }

    if (frag.type.endsWith("[]") && type instanceof ArrayTypeId && type.size === undefined) {
        return match(type.elT, { ...frag, type: frag.type.slice(0, -2) });
    }

    if (type instanceof TupleTypeId && frag.type === "tuple") {
        if (frag.components === undefined || type.components.length !== frag.components.length) {
            return false;
        }

        for (let i = 0; i < type.components.length; i++) {
            if (!match(type.components[i], frag.components[i])) {
                return false;
            }
        }

        return true;
    }

    if (frag.type === "function" && type instanceof FixedBytesTypeId && type.numBytes === 24) {
        return true;
    }

    if (
        type instanceof IntTypeId ||
        type instanceof StringTypeId ||
        type instanceof BytesTypeId ||
        type instanceof AddressTypeId ||
        type instanceof BoolTypeId ||
        type instanceof FixedBytesTypeId
    ) {
        return type.pp().slice(2) == frag.type;
    }

    assert(false, `Can't match(${type.pp()}, ${JSON.stringify(frag)})`);
}

function getId(
    node: FunctionDefinition | VariableDeclaration | EventDefinition | ErrorDefinition
): string {
    let type: string;
    let name = node.name;

    if (node instanceof FunctionDefinition) {
        if (node.kind === FunctionKind.Constructor) {
            type = "constructor";
            name = "";
        } else if (node.kind === FunctionKind.Fallback) {
            type = "fallback";
            name = "";
        } else if (node.kind === FunctionKind.Receive) {
            type = "receive";
            name = "";
        } else {
            type = "function";
        }
    } else if (node instanceof VariableDeclaration) {
        type = "function";
    } else if (node instanceof EventDefinition) {
        type = "event";
    } else {
        type = "error";
    }

    return `${type}:${name}`;
}

function getFragMap(frags: AbiFragment[]): Map<string, AbiFragment> {
    return new Map<string, AbiFragment>(
        frags.map((f) => [isAbiConstructorFragment(f) ? `constructor:` : `${f.type}:${f.name}`, f])
    );
}

function getFragments(json: any[]): AbiFragment[] {
    const res: AbiFragment[] = [];
    for (const frag of json) {
        if (isAbiFragment(frag)) {
            res.push(frag);
        }
    }

    return res;
}
