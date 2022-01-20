import expect from "expect";
import fse from "fs-extra";
import {
    ASTKind,
    ASTReader,
    CompilerKind,
    CompilerVersions08,
    compileSol,
    detectCompileErrors,
    PossibleCompilerKinds,
    SourceUnit
} from "../../../src";
import { createImprint } from "./common";

const mainSample = "./test/samples/solidity/latest_08.sol";
const mainContent = fse.readFileSync(mainSample).toString();
const importSample = "./test/samples/solidity/latest_imports_08.sol";
const importContent = fse.readFileSync(importSample).toString();

const expectedFiles = new Map<string, string>([
    [mainSample, mainContent],
    [importSample, importContent]
]);

const compilerVersion = CompilerVersions08[CompilerVersions08.length - 1];

const encounters = new Map<string, number>([
    ["SourceUnit", 1],
    ["PragmaDirective", 2],
    ["ImportDirective", 1],
    ["EnumDefinition", 2],
    ["EnumValue", 6],
    ["ContractDefinition", 8],
    ["FunctionDefinition", 15],
    ["ParameterList", 39],
    ["VariableDeclaration", 23],
    ["ElementaryTypeName", 23],
    ["Block", 32],
    ["VariableDeclarationStatement", 9],
    ["Literal", 21],
    ["UncheckedBlock", 2],
    ["ExpressionStatement", 7],
    ["UnaryOperation", 2],
    ["Identifier", 21],
    ["Return", 5],
    ["InheritanceSpecifier", 1],
    ["IdentifierPath", 11],
    ["UsingForDirective", 1],
    ["UserDefinedTypeName", 6],
    ["ModifierInvocation", 2],
    ["FunctionCall", 16],
    ["MemberAccess", 9],
    ["OverrideSpecifier", 1],
    ["ElementaryTypeNameExpression", 3],
    ["NewExpression", 2],
    ["TryStatement", 2],
    ["TryCatchClause", 8],
    ["IfStatement", 3],
    ["BinaryOperation", 3],
    ["EventDefinition", 1],
    ["ModifierDefinition", 1],
    ["PlaceholderStatement", 1],
    ["TupleExpression", 2],
    ["EmitStatement", 1],
    ["WhileStatement", 1],
    ["Continue", 1],
    ["DoWhileStatement", 1],
    ["Break", 1],
    ["ForStatement", 1],
    ["InlineAssembly", 3],
    ["ErrorDefinition", 3],
    ["StructuredDocumentation", 3],
    ["RevertStatement", 3]
]);

for (const compilerKind of PossibleCompilerKinds) {
    describe(`Compile ${mainSample} with ${compilerVersion} compiler`, () => {
        const astKind = ASTKind.Modern;

        let data: any = {};
        let sourceUnits: SourceUnit[];

        before("Compile", async () => {
            const result = await compileSol(
                mainSample,
                "auto",
                [],
                undefined,
                undefined,
                compilerKind as CompilerKind
            );

            expect(result.compilerVersion).toEqual(compilerVersion);
            expect(result.files).toEqual(expectedFiles);

            const errors = detectCompileErrors(result.data);

            expect(errors).toHaveLength(0);

            data = result.data;
        });

        it(`Parse compiler output (${astKind})`, () => {
            const reader = new ASTReader();

            sourceUnits = reader.read(data, astKind);

            expect(sourceUnits.length).toEqual(2);

            const sourceUnit = sourceUnits[0];

            expect(sourceUnit.id).toEqual(315);
            expect(sourceUnit.src).toEqual("0:4733:0");
            expect(sourceUnit.absolutePath).toEqual(mainSample);
            expect(sourceUnit.children.length).toEqual(13);
            expect(sourceUnit.getChildren().length).toEqual(309);
        });

        it(`Validate parsed output (${astKind})`, () => {
            const sourceUnit = sourceUnits[0];
            const sourceUnitImprint = createImprint(sourceUnit);

            expect(sourceUnitImprint.ASTNode).toBeUndefined();

            for (const [type, count] of encounters.entries()) {
                expect(sourceUnitImprint[type]).toBeDefined();
                expect(sourceUnitImprint[type].length).toEqual(count);

                const nodes = sourceUnit.getChildrenBySelector(
                    (node) => node.type === type,
                    type === "SourceUnit"
                );

                expect(nodes.length).toEqual(count);
            }
        });
    });
}
