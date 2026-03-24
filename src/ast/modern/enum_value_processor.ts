import { ASTReader, ASTReaderConfiguration } from "../ast_reader";
import { EnumValue } from "../implementation/declaration/enum_value";
import { ModernNodeProcessor } from "./node_processor";
import { StructuredDocumentation } from "../implementation/meta";

export class ModernEnumValueProcessor extends ModernNodeProcessor<EnumValue> {
    process(
        reader: ASTReader,
        config: ASTReaderConfiguration,
        raw: any
    ): ConstructorParameters<typeof EnumValue> {
        const [id, src] = super.process(reader, config, raw);

        const name: string = raw.name;
        const nameLocation: string | undefined = raw.nameLocation;
        let documentation: string | StructuredDocumentation | undefined;

        if (raw.documentation) {
            documentation =
                typeof raw.documentation === "string"
                    ? raw.documentation
                    : reader.convert(raw.documentation, config);
        }
        return [id, src, name, documentation, nameLocation, raw];
    }
}
