{
    // Dummy uses to silence unused function TSC errors in auto-generated code
    expected;
    error;
    location;
    peg$anyExpectation;
}

TypeIdentifier
    = AddressType
    / IntType
    / FixedPointType 
    / RationalType
    / StringLiteralType
    / FixedBytesType
    / ArraySliceType
    / PointerType
    / RefType
    / MagicType
    / ContractType
    / EnumType
    / ErrorType
    / FunctionType
    / UserDefinedValueType
    / BoolType
    / MappingType
    / MetaType
    / ModifierType
    / ModuleType 
    / SuperType
    / TupleType
    / TypeType

TypeList
    = head: TypeIdentifier tail: ("_$_" rest: TypeIdentifier { return rest; })* {
        return tail.reduce((acc: ast.TypeIdentifier[], x: ast.TypeIdentifier) => { acc.push(x); return acc; }, [head]);
    }

ParenthesizedTypeList
    = "$_" lst: TypeList? "_$" { return lst === null ? [] : lst; }

Identifier = [a-zA-Z]([a-zA-Z0-9]+ / "$$$" { return "$"; } / ("_" !( [$]!. / [$][^$])))* { return text().replace("$$$", "$"); }

ParenthesizedUserIdentifier
    = "$_" id: Identifier "_$" { return id.replaceAll("$$$", "$"); }

AddressType
    = "t_address_payable" { return new ast.AddressTypeId(true); }
    / "t_address" { return new ast.AddressTypeId(false); }

IntType
    = "t_" signed: (t: "u" ? { return t == null; } ) "int" numBits: Nat { return new ast.IntTypeId(numBits, signed); }

FixedPointType
    = "t_" signed: (t: "u" ? { return t == null; } ) "fixed" numBits: Nat "x" fractionalDigits: Nat { return new ast.FixedPointTypeId(Number(numBits), Number(fractionalDigits), signed); }

RationalType
    = "t_rational_" negative: (t: "minus_" ? { return t !== null; })  negative2: (t1: "-"? {return t1 !== null;}) numerator: BigInt "_by_" denominator: BigInt { return new ast.RationalNumTypeId(negative || negative2 ? -numerator : numerator, denominator); }

StringLiteralType
    = "t_stringliteral_" hash: (HexDigit+ {return text();}) { return new ast.StringLiteralTypeId(hash); }

FixedBytesType
    = "t_bytes" numBytes: Nat { return new ast.FixedBytesTypeId(numBytes); }

BytesType
    = "t_bytes" { return new ast.BytesTypeId(); }

StringType
    = "t_string" { return new ast.StringTypeId(); }

ArraySize
    = "dyn" { return "dyn"; }
    / Nat

ArrayType
    = "t_array" elT: ParenthesizedTypeList size: ArraySize
    {
        assert(elT.length == 1, ``);
        return new ast.ArrayTypeId(elT[0], size === "dyn" ? undefined : BigInt(size))
    }

RefType
    = BytesType
    / StringType
    / ArrayType
    / StructType

PointerType
    = toT: RefType "_" loc: ("storage" / "memory" / "calldata" / "transient") isPtr: ("_ptr"?)
    {
        return new ast.PointerTypeId(toT, loc, isPtr !== null);
    }

ArraySliceType
    = arrT: PointerType "_slice"
    {
        assert(arrT instanceof ast.PointerTypeId, ``);

        return new ast.ArraySliceTypeId(arrT);
    }

MagicType
    = "t_magic_block" { return new ast.BuiltinStructTypeId("block"); }
    / "t_magic_message" { return new ast.BuiltinStructTypeId("message"); }
    / "t_magic_transaction" { return new ast.BuiltinStructTypeId("transaction"); }
    / "t_magic_abi" { return new ast.BuiltinStructTypeId("abi"); }

ContractType 
    = "t_contract" name: ParenthesizedUserIdentifier id: Nat { return new ast.ContractTypeId(name, Number(id)); }

SuperType 
    = "t_super" name: ParenthesizedUserIdentifier id: Nat { return new ast.SuperTypeId(name, Number(id)); }

EnumType 
    = "t_enum" name: ParenthesizedUserIdentifier id: Nat { return new ast.EnumTypeId(name, Number(id)); }

ErrorType 
    = "t_error" { return new ast.ErrorTypeId(); }

FunctionKind 
    =("declaration"
    / "internal"
    / "external"
    / "delegatecall"
    / "barecallcode"
    / "barecall"
    / "baredelegatecall"
    / "barestaticcall"
    / "creation"
    / "send"
    / "transfer"
    / "keccak256"
    / "selfdestruct"
    / "revert"
    / "ecrecover"
    / "sha3"
    / "sha256"
    / "ripemd160"
    / "gasleft"
    / "event"
    / "error"
    / "wrap"
    / "unwrap"
    / "setgas"
    / "setvalue"
    / "blockhash"
    / "addmod"
    / "mulmod"
    / "arraypush"
    / "arraypop"
    / "bytesconcat"
    / "stringconcat"
    / "objectcreation"
    / "assert"
    / "require"
    / "abiencodepacked"
    / "abiencodewithselector"
    / "abiencodecall"
    / "abiencodewithsignature"
    / "abiencode"
    / "abidecode"
    / "blobhash"
    / "metatype"
    / "log0"
    / "log1"
    / "log2"
    / "log3"
    / "log4"
    ) { return text(); }

StateMutability
    = ("pure" / "view" / "nonpayable" / "payable") { return text(); }

FunctionType
    = "t_function_" kind: FunctionKind "_" mutability: StateMutability parameters: ParenthesizedTypeList "returns" returns: ParenthesizedTypeList hasGas: ("gas"?) hasValue: ("value"?) hasSalt: ("salt"?) boundFirstArgType: (("attached_to"/"bound_to") argT: ParenthesizedTypeList { return argT; })?
    {
        let firstArgT: ast.TypeIdentifier | undefined = undefined;

        if (boundFirstArgType !== null) {
            assert(boundFirstArgType.length == 1, ``)
            firstArgT = boundFirstArgType[0];
        }

        return new ast.FunctionTypeId(kind, mutability, parameters, returns, hasGas !== null, hasValue !== null, hasSalt !== null, firstArgT)
    }

UserDefinedValueType
    = "t_userDefinedValueType" name: ParenthesizedUserIdentifier id: Nat { return new ast.UserDefinedValueTypeId(name, Number(id)); }

BoolType
    = "t_bool" { return new ast.BoolTypeId(); }

MappingType
    = "t_mapping" types: ParenthesizedTypeList
    {
        assert(types.length == 2, "Expected 2 types for mapping");
        return new ast.MappingTypeId(types[0], types[1]);
    }

MetaType
    = "t_magic_meta_type_" actualT: TypeIdentifier { return new ast.MetaTypeTypeId(actualT); }

ModifierType
    = "t_modifier" parameters: ParenthesizedTypeList { return new ast.ModifierTypeId(parameters); }

ModuleType
    = "t_module_" id: Nat { return new ast.ModuleTypeId(Number(id)); }

StructType
    = "t_struct" name: ParenthesizedUserIdentifier id: Nat { return new ast.StructTypeId(name, Number(id)); }

TupleType
    = "t_tuple" components: ParenthesizedTypeList { return new ast.TupleTypeId(components); }

TypeType
    = "t_type" innerT: ParenthesizedTypeList 
    {
        assert(innerT.length === 1, `Expected a single type in type()`)
        return new ast.TypeTypeId(innerT[0]);
    }

Nat =
    DecDigit+ { return Number(text()); }

BigInt =
    DecDigit+ { return BigInt(text()); }

DecDigit =
    [0-9]

HexDigit =
    [0-9a-f]i