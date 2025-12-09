import fse from "fs-extra";
import path from "path";
import {
    assert,
    ASTKind,
    ASTReader,
    CompileResult,
    CompilerKind,
    compileSol,
    detectCompileErrors,
    SourceUnit
} from "../../src";

export function searchRecursive(targetPath: string, filter: (entry: string) => boolean): string[] {
    const stat = fse.statSync(targetPath);
    const results: string[] = [];

    if (stat.isFile()) {
        if (filter(targetPath)) {
            results.push(path.resolve(targetPath));
        }

        return results;
    }

    for (const entry of fse.readdirSync(targetPath)) {
        const resolvedEntry = path.resolve(targetPath, entry);
        const stat = fse.statSync(resolvedEntry);

        if (stat.isDirectory()) {
            results.push(...searchRecursive(resolvedEntry, filter));
        } else if (stat.isFile() && filter(resolvedEntry)) {
            results.push(resolvedEntry);
        }
    }

    return results;
}

export async function loadSample(
    fileName: string,
    kind?: ASTKind,
    version?: string
): Promise<[CompileResult, SourceUnit[], string]> {
    kind = kind === undefined ? ASTKind.Modern : kind;
    version = version === undefined ? "auto" : version;

    const result = await compileSol(
        fileName,
        version,
        undefined,
        undefined,
        undefined,
        CompilerKind.Native
    );

    const errors = detectCompileErrors(result.data);
    assert(
        errors.length === 0 && result.compilerVersion !== undefined,
        `Failed compiling ${fileName}`
    );

    const reader = new ASTReader();
    const sourceUnits = reader.read(result.data, ASTKind.Modern);

    return [result, sourceUnits, result.compilerVersion];
}
