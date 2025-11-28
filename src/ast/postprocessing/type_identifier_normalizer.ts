import { parseTypeIdentifier, TypeTypeId } from "../../typeIdentifiers";
import { ASTNode } from "../ast_node";
import { ASTContext, ASTNodePostprocessor } from "../ast_reader";
import { VariableDeclaration } from "../implementation/declaration";
import { ElementaryTypeNameExpression, Expression, Identifier } from "../implementation/expression";
import { ImportDirective } from "../implementation/meta";
import { TypeName } from "../implementation/type";

type SupportedNode = Expression | VariableDeclaration | TypeName;

export class TypeIdentifierNormalizer implements ASTNodePostprocessor<SupportedNode> {
    process(node: SupportedNode, context: ASTContext): void {
        if (typeof node.typeIdentifier === "string") {
            return;
        }

        // In 0.6.x typeNames under ElementaryTypeNameExpressions are sometimes null. In later solidity they are undefined
        if (
            node instanceof TypeName &&
            (node.typeIdentifier === null || node.typeIdentifier === undefined) &&
            node.parent instanceof ElementaryTypeNameExpression &&
            typeof node.parent.typeIdentifier === "string"
        ) {
            const parentType = parseTypeIdentifier(node.parent.typeIdentifier);
            if (parentType instanceof TypeTypeId) {
                node.typeIdentifier = parentType.actualT.pp();
            }
        }

        if (node instanceof Identifier && node.parent instanceof ImportDirective && node.typeIdentifier === undefined && node.vReferencedDeclaration instanceof VariableDeclaration) {
            node.typeIdentifier = node.vReferencedDeclaration.typeIdentifier;
        }
    }

    isSupportedNode(node: ASTNode): node is SupportedNode {
        return (
            node instanceof Expression ||
            node instanceof VariableDeclaration ||
            node instanceof TypeName
        );
    }
}
