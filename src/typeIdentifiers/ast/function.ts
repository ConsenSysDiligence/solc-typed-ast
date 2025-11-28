import { TypeIdentifier } from "./type_identifier";
import { ppTypeIdentifierList } from "./utils";

export type FunctionTypeKind =
    | "declaration"
    | "internal"
    | "external"
    | "delegatecall"
    | "barecall"
    | "barecallcode"
    | "baredelegatecall"
    | "barestaticcall"
    | "creation"
    | "send"
    | "transfer"
    | "keccak256"
    | "selfdestruct"
    | "revert"
    | "ecrecover"
    | "sha3"
    | "sha256"
    | "ripemd160"
    | "gasleft"
    | "event"
    | "error"
    | "wrap"
    | "unwrap"
    | "setgas"
    | "setvalue"
    | "blockhash"
    | "addmod"
    | "mulmod"
    | "arraypush"
    | "arraypop"
    | "bytesconcat"
    | "stringconcat"
    | "objectcreation"
    | "assert"
    | "require"
    | "abiencode"
    | "abiencodepacked"
    | "abiencodewithselector"
    | "abiencodecall"
    | "abiencodewithsignature"
    | "abidecode"
    | "blobhash"
    | "metatype"
    | "log0"
    | "log1"
    | "log2"
    | "log3"
    | "log4";

export type FunctionTypeMutability = "pure" | "view" | "nonpayable" | "payable";

export class FunctionTypeId extends TypeIdentifier {
    constructor(
        public readonly kind: FunctionTypeKind,
        public readonly mutability: FunctionTypeMutability,
        public readonly parameters: TypeIdentifier[],
        public readonly returns: TypeIdentifier[],
        public readonly gasSet: boolean,
        public readonly valueSet: boolean,
        public readonly saltSet: boolean,
        public readonly boundFirstArgT?: TypeIdentifier
    ) {
        super();
    }

    pp(): string {
        let res = `t_function_${this.kind}_${this.mutability}${ppTypeIdentifierList(this.parameters)}returns${ppTypeIdentifierList(this.returns)}`;

        if (this.gasSet) {
            res += "gas";
        }

        if (this.valueSet) {
            res += "value";
        }

        if (this.saltSet) {
            res += "salt";
        }

        if (this.boundFirstArgT) {
            res += `attached_to${this.boundFirstArgT.pp()}`;
        }

        return res;
    }
}
