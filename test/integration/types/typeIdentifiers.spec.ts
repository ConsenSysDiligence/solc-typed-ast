import expect from "expect";
import fse from "fs-extra";
import { join } from "path";
import { lt } from "semver";
import {
    assert,
    ASTKind,
    ASTReader,
    CompileResult,
    CompilerKind,
    CompilerVersions,
    compileSol,
    detectCompileErrors,
    Expression,
    Identifier,
    ImportDirective,
    SourceUnit,
    TypeName,
    typeOf,
    VariableDeclaration
} from "../../../src";

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
    ["./test/samples/solidity/resolving/shadowing_overloading_and_overriding.sol", undefined],
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
    ["test/samples/solidity/dispatch_05.sol", undefined],
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
        });
    }
});
