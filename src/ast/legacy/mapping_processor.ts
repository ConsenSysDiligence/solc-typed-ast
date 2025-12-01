import { ASTReader, ASTReaderConfiguration } from "../ast_reader";
import { Mapping } from "../implementation/type/mapping";
import { TypeName } from "../implementation/type/type_name";
import { LegacyTypeNameProcessor } from "./type_name_processor";

export class LegacyMappingProcessor extends LegacyTypeNameProcessor<Mapping> {
    process(
        reader: ASTReader,
        config: ASTReaderConfiguration,
        raw: any
    ): ConstructorParameters<typeof Mapping> {
        const [id, src, typeString, typeIdentifier] = super.process(reader, config, raw);

        const [keyType, valueType] = reader.convertArray(raw.children, config) as [
            TypeName,
            TypeName
        ];

        return [id, src, typeString, typeIdentifier, keyType, valueType, raw];
    }
}
