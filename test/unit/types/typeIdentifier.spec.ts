import * as ast from "../../../src/typeIdentifiers/ast";
import { parseTypeIdentifier } from "../../../src/typeIdentifiers";
import { DataLocation } from "../../../src";

const bytesT = new ast.BytesTypeId();
const stringT = new ast.StringTypeId();
const memStringPtrT = new ast.PointerTypeId(stringT, DataLocation.Memory, true)
const uint256T = new ast.IntTypeId(256, false);
const int256T = new ast.IntTypeId(256, true);
const int8T = new ast.IntTypeId(8, true);
const bytes2T = new ast.FixedBytesTypeId(2);
const bytes4T = new ast.FixedBytesTypeId(4);
const boolT = new ast.BoolTypeId();
const addressT = new ast.AddressTypeId(false)

const samples: Array<[string, ast.TypeIdentifier]> = [
    ["t_address", addressT],
    ["t_address_payable", new ast.AddressTypeId(true)],
    ["t_uint256", uint256T],
    ["t_int8", int8T],
    ["t_int32", new ast.IntTypeId(32, true)],
    ["t_uint32", new ast.IntTypeId(32, false)],
    ["t_rational_323423_by_1231", new ast.RationalNumTypeId(323423n, 1231n)],
    ["t_rational_minus_3_by_2", new ast.RationalNumTypeId(-3n, 2n)],
    [
        "t_stringliteral_83c737ad570e9f3e71e0d2800958e44770d812e92db2c1758626613d1e6ba514",
        new ast.StringLiteralTypeId(
            "83c737ad570e9f3e71e0d2800958e44770d812e92db2c1758626613d1e6ba514"
        )
    ],
    ["t_bytes1", new ast.FixedBytesTypeId(1)],
    ["t_bytes24", new ast.FixedBytesTypeId(24)],
    ["t_bytes32", new ast.FixedBytesTypeId(32)],
    ["t_bytes", bytesT],
    ["t_string", stringT],
    ["t_string_memory", new ast.PointerTypeId(stringT, DataLocation.Memory, false)],
    ["t_string_storage_ptr", new ast.PointerTypeId(stringT, DataLocation.Storage, true)],
    ["t_bytes_calldata", new ast.PointerTypeId(bytesT, DataLocation.CallData, false)],
    [
        "t_array$_t_uint256_$dyn_memory",
        new ast.PointerTypeId(new ast.ArrayTypeId(uint256T), DataLocation.Memory, false)
    ],
    [
        "t_array$_t_array$_t_int8_$4_storage_$dyn_storage",
        new ast.PointerTypeId(
            new ast.ArrayTypeId(
                new ast.PointerTypeId(new ast.ArrayTypeId(int8T, 4n), DataLocation.Storage, false)
            ),
            DataLocation.Storage,
            false
        )
    ],
    [
        "t_bytes_calldata_ptr_slice",
        new ast.ArraySliceTypeId(
            new ast.PointerTypeId(new ast.BytesTypeId(), DataLocation.CallData, true)
        )
    ],
    ["t_magic_block", new ast.BuiltinStructTypeId("block")],
    ["t_magic_message", new ast.BuiltinStructTypeId("message")],
    ["t_magic_transaction", new ast.BuiltinStructTypeId("transaction")],
    ["t_magic_abi", new ast.BuiltinStructTypeId("abi")],
    ["t_contract$_AB$$$C__$21", new ast.ContractTypeId("AB$C_", 21)],
    ["t_enum$_A$$$DC_$$$_$21", new ast.EnumTypeId("A$DC_$", 21)],
    ["t_error", new ast.ErrorTypeId()],
    ["t_fixed256x10", new ast.FixedPointTypeId(256, 10, true)],
    ["t_ufixed32x2", new ast.FixedPointTypeId(32, 2, false)],
    [
        "t_function_internal_pure$__$returns$__$",
        new ast.FunctionTypeId("internal", "pure", [], [], false, false, false)
    ],
    [
        "t_function_event_nonpayable$_t_uint256_$returns$__$",
        new ast.FunctionTypeId("event", "nonpayable", [uint256T], [], false, false, false)
    ],
    [
        "t_function_declaration_pure$_t_uint256_$_t_int256_$_t_bytes2_$returns$_t_bytes2_$_t_int256_$_t_uint256_$",
        new ast.FunctionTypeId(
            "declaration",
            "pure",
            [uint256T, int256T, bytes2T],
            [bytes2T, int256T, uint256T],
            false,
            false,
            false
        )
    ],
    [
        "t_function_require_pure$_t_bool_$returns$__$",
        new ast.FunctionTypeId(
            "require",
            "pure",
            [boolT],
            [],
            false,
            false,
            false
        )
    ],
    [
        "t_function_unwrap_pure$_t_userDefinedValueType$_RestrictedNumber_0813_$583_$returns$_t_int256_$",
        new ast.FunctionTypeId(
            "unwrap",
            "pure",
            [new ast.UserDefinedValueTypeId("RestrictedNumber_0813", 583)],
            [int256T],
            false,
            false,
            false
        )
    ],
    [
        "t_function_wrap_pure$_t_int256_$returns$_t_userDefinedValueType$_RestrictedNumber_0813_$583_$",
        new ast.FunctionTypeId(
            "wrap",
            "pure",
            [int256T],
            [new ast.UserDefinedValueTypeId("RestrictedNumber_0813", 583)],
            false,
            false,
            false
        )
    ],
    [
        "t_function_external_pure$_t_uint256_$_t_int256_$_t_bytes2_$returns$_t_bytes2_$_t_int256_$_t_uint256_$",
        new ast.FunctionTypeId(
            "external",
            "pure",
            [uint256T, int256T, bytes2T],
            [bytes2T, int256T, uint256T],
            false,
            false,
            false
        )
    ],
    [
        "t_mapping$_t_address_$_t_uint256_$",
        new ast.MappingTypeId(addressT, uint256T)
    ],
    [
        "t_magic_meta_type_t_enum$_EnumABC_$12",
        new ast.MetaTypeTypeId(new ast.EnumTypeId("EnumABC", 12))
    ],
    [
        "t_modifier$_t_string_memory_ptr_$",
        new ast.ModifierTypeId([memStringPtrT])
    ],
    [
        "t_module_42",
        new ast.ModuleTypeId(42)
    ],
    [
        "t_struct$_GlobalStruct_$25_memory_ptr",
        new ast.PointerTypeId(new ast.StructTypeId("GlobalStruct", 25), DataLocation.Memory, true)
    ],
    [
        "t_struct$_GlobalStruct_$25_storage_ptr",
        new ast.PointerTypeId(new ast.StructTypeId("GlobalStruct", 25), DataLocation.Storage, true)
    ],
    [
        "t_super$_B_$208",
        new ast.SuperTypeId("B", 208)
    ],
    [
        "t_tuple$__$",
        new ast.TupleTypeId([])
    ],
    [
        "t_tuple$_t_address_$_t_bytes4_$",
        new ast.TupleTypeId([addressT, bytes4T])
    ],
    [
        "t_tuple$_t_rational_1_by_1_$_t_rational_minus_1_by_1_$_t_rational_65536_by_1_$",
        new ast.TupleTypeId([new ast.RationalNumTypeId(1n, 1n), new ast.RationalNumTypeId(-1n, 1n), new ast.RationalNumTypeId(65536n, 1n)])
    ],
    [
        "t_type$_t_address_$",
        new ast.TypeTypeId(addressT)
    ],
    [
        "t_mapping$_t_address_$_t_mapping$_t_uint256_$_t_uint256_$_$",
        new ast.MappingTypeId(addressT, new ast.MappingTypeId(uint256T, uint256T))
    ]
];

describe("typeIdetifier parser tests", () => {
    for (const [text, expectedT] of samples) {
        it(text, () => {
            const parsedT = parseTypeIdentifier(text);
            if (parsedT instanceof ast.EnumTypeId) {
                console.error(
                    `Parsed name: ${parsedT.name} expected: ${(expectedT as ast.ContractTypeId).name}`
                );
            }
            expect(parsedT.pp()).toEqual(expectedT.pp());
            expect(parsedT.pp()).toEqual(text);
        });
    }
});
