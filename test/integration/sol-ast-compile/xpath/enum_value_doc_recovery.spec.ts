import expect from "expect";
import { PossibleCompilerKinds } from "../../../../src";
import { SolAstCompileCommand, SolAstCompileExec } from "../common";

const sample = "test/samples/solidity/enum_value_docs.sol";

for (const kind of PossibleCompilerKinds) {
    const selector = '//EnumValue/StructuredDocumentation/@*[name()="src" or name()="text"]';
    const args = [
        sample,
        "--compiler-kind",
        kind,
        "--compiler-version",
        "0.8.30",
        "--xpath",
        selector
    ];

    const command = SolAstCompileCommand(...args);

    describe(command, () => {
        let exitCode: number | null;
        let outData: string;
        let errData: string;

        beforeAll(() => {
            const result = SolAstCompileExec(...args);

            outData = result.stdout;
            errData = result.stderr;
            exitCode = result.status;
        });

        it("Exit code is valid", () => {
            expect(exitCode).toEqual(0);
        });

        it("STDERR is empty", () => {
            expect(errData).toEqual("");
        });

        it("STDOUT contains enum value documentation", () => {
            // Check for documentation text
            expect(outData).toContain("@notice A");
            expect(outData).toContain("@dev B");
            expect(outData).toContain("@notice Active");
            expect(outData).toContain("@notice Inactive");
            expect(outData).toContain("Read permission");
            expect(outData).toContain("Write permission");
            expect(outData).toContain("Admin permission");
        });
    });
}
