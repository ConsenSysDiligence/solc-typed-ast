import { ASTReader, ASTReaderConfiguration } from "../ast_reader";
import { FunctionStateMutability, FunctionVisibility } from "../constants";
import { ParameterList } from "../implementation/meta/parameter_list";
import { FunctionTypeName } from "../implementation/type/function_type_name";
import { ModernTypeNameProcessor } from "./type_name_processor";

export class ModernFunctionTypeNameProcessor extends ModernTypeNameProcessor<FunctionTypeName> {
    process(
        reader: ASTReader,
        config: ASTReaderConfiguration,
        raw: any
    ): ConstructorParameters<typeof FunctionTypeName> {
        const [id, src, typeString, typeIdentifier] = super.process(reader, config, raw);

        const visibility: FunctionVisibility = raw.visibility;
        const stateMutability: FunctionStateMutability = raw.stateMutability;

        const parameterTypes = reader.convert(raw.parameterTypes, config) as ParameterList;
        const returnParameterTypes = reader.convert(
            raw.returnParameterTypes,
            config
        ) as ParameterList;

        return [
            id,
            src,
            typeString,
            typeIdentifier,
            visibility,
            stateMutability,
            parameterTypes,
            returnParameterTypes,
            raw
        ];
    }
}
