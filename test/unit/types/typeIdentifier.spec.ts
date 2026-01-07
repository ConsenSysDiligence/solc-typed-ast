import * as ast from "../../../src/typeIdentifiers/ast";
import { DataLocation, SourceUnit, StateVariableVisibility } from "../../../src";
import {
    changeLocationTo,
    generalize,
    getterArgsAndReturn,
    parseTypeIdentifier,
    specialize
} from "../../../src/typeIdentifiers";
import { loadSample } from "../../utils/file";
import {
    addressT,
    boolT,
    bytes1T,
    bytes2T,
    bytes32T,
    bytes4T,
    bytesT,
    int256T,
    int8T,
    memBytesPtrT,
    memStringPtrT,
    stringT,
    uint256T,
    uint8T
} from "../../../src/typeIdentifiers/constants";

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
        new ast.FunctionTypeId("require", "pure", [boolT], [], false, false, false)
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
    ["t_mapping$_t_address_$_t_uint256_$", new ast.MappingTypeId(addressT, uint256T)],
    [
        "t_magic_meta_type_t_enum$_EnumABC_$12",
        new ast.MetaTypeTypeId(new ast.EnumTypeId("EnumABC", 12))
    ],
    ["t_modifier$_t_string_memory_ptr_$", new ast.ModifierTypeId([memStringPtrT])],
    ["t_module_42", new ast.ModuleTypeId(42)],
    [
        "t_struct$_GlobalStruct_$25_memory_ptr",
        new ast.PointerTypeId(new ast.StructTypeId("GlobalStruct", 25), DataLocation.Memory, true)
    ],
    [
        "t_struct$_GlobalStruct_$25_storage_ptr",
        new ast.PointerTypeId(new ast.StructTypeId("GlobalStruct", 25), DataLocation.Storage, true)
    ],
    ["t_super$_B_$208", new ast.SuperTypeId("B", 208)],
    ["t_tuple$__$", new ast.TupleTypeId([])],
    ["t_tuple$_t_address_$_t_bytes4_$", new ast.TupleTypeId([addressT, bytes4T])],
    [
        "t_tuple$_t_rational_1_by_1_$_t_rational_minus_1_by_1_$_t_rational_65536_by_1_$",
        new ast.TupleTypeId([
            new ast.RationalNumTypeId(1n, 1n),
            new ast.RationalNumTypeId(-1n, 1n),
            new ast.RationalNumTypeId(65536n, 1n)
        ])
    ],
    ["t_type$_t_address_$", new ast.TypeTypeId(addressT)],
    [
        "t_mapping$_t_address_$_t_mapping$_t_uint256_$_t_uint256_$_$",
        new ast.MappingTypeId(addressT, new ast.MappingTypeId(uint256T, uint256T))
    ]
];

describe("typeIdetifier parser tests", () => {
    for (const [text, expectedT] of samples) {
        it(text, () => {
            const parsedT = parseTypeIdentifier(text);
            expect(parsedT.pp()).toEqual(expectedT.pp());
            expect(parsedT.pp()).toEqual(text);
        });
    }
});

describe("typeIdetifier changeLocTo round-trip test", () => {
    for (const [text] of samples) {
        it(text, () => {
            const parsedT = parseTypeIdentifier(text);
            const memVersion = changeLocationTo(parsedT, DataLocation.Memory);
            const storageVersion = changeLocationTo(memVersion, DataLocation.Storage);
            const memVersion2 = changeLocationTo(storageVersion, DataLocation.Memory);
            expect(memVersion2.pp()).toEqual(memVersion.pp());
        });
    }
});

describe("typeIdetifier getterArgsAndReturns", () => {
    let units: SourceUnit[];

    beforeAll(async () => {
        const res = await loadSample("test/samples/solidity/getters_08.sol");
        units = res[1];
    });

    const expected = new Map<string, [ast.TypeIdentifier[], ast.TypeIdentifier]>([
        ["a", [[uint256T], uint256T]],
        ["b", [[addressT], uint256T]],
        ["c", [[], uint8T]],
        ["d", [[], new ast.TupleTypeId([uint8T, bytes1T])]],
        ["e", [[], addressT]],
        [
            "f",
            [
                [uint256T],
                new ast.TupleTypeId([
                    int8T,
                    stringT,
                    new ast.TupleTypeId([uint8T, new ast.ArrayTypeId(uint256T), bytes1T])
                ])
            ]
        ],
        ["g", [[uint256T], addressT]],
        ["h", [[], addressT]],
        ["i", [[], int256T]],
        ["addr", [[], addressT]],
        ["ap", [[], addressT]],
        ["b1", [[], bytes1T]],
        ["b32", [[], bytes32T]],
        ["udtvMapping", [[addressT, uint256T], uint256T]],
        [
            "complexMap",
            [
                [bytesT, stringT, uint256T],
                new ast.TupleTypeId([
                    int8T,
                    stringT,
                    new ast.TupleTypeId([uint8T, new ast.ArrayTypeId(uint256T), bytes1T])
                ])
            ]
        ],
        ["j", [[], addressT]],
    ]);

    it(`Sample test/samples/solidity/getters_08.sol`, () => {
        for (const sVar of units[0].vContracts[1].vStateVariables) {
            if (sVar.visibility !== StateVariableVisibility.Public) {
                continue;
            }

            if (!expected.has(sVar.name)) {
                continue;
            }

            const [expArgs, expRet] = expected.get(sVar.name) as [
                ast.TypeIdentifier[],
                ast.TypeIdentifier
            ];
            const [args, ret] = getterArgsAndReturn(sVar);

            console.error(
                sVar.name,
                "expected: ",
                expArgs.map((t) => t.pp()),
                expRet.pp(),
                "got: ",
                args.map((t) => t.pp()),
                ret.pp()
            );
            expect(args.map((t) => t.pp())).toEqual(expArgs.map((t) => t.pp()));
            expect(ret.pp()).toEqual(expRet.pp());
        }
    });
});

it("generalize/specialize typeIdentifiers", () => {
    const samples: ast.TypeIdentifier[] = [
        addressT,
        new ast.AddressTypeId(true),
        uint256T,
        int8T,
        new ast.IntTypeId(32, true),
        new ast.IntTypeId(32, false),
        new ast.RationalNumTypeId(323423n, 1231n),
        new ast.RationalNumTypeId(-3n, 2n),
        new ast.StringLiteralTypeId(
            "83c737ad570e9f3e71e0d2800958e44770d812e92db2c1758626613d1e6ba514"
        ),
        new ast.FixedBytesTypeId(1),
        new ast.FixedBytesTypeId(24),
        new ast.FixedBytesTypeId(32),
        memBytesPtrT,
        memStringPtrT,
        new ast.PointerTypeId(new ast.ArrayTypeId(uint256T), DataLocation.Memory, true),
        new ast.PointerTypeId(
            new ast.ArrayTypeId(
                new ast.PointerTypeId(new ast.ArrayTypeId(int8T, 4n), DataLocation.Storage, true)
            ),
            DataLocation.Storage,
            true
        ),
        new ast.TupleTypeId([
            memBytesPtrT,
            uint256T,
            memStringPtrT,
            new ast.TupleTypeId([new ast.FixedBytesTypeId(32), memBytesPtrT])
        ])
    ];

    for (const sample of samples) {
        const gen = generalize(sample);
        const s1 = specialize(gen, DataLocation.Memory);
        expect(s1.pp()).toEqual(changeLocationTo(sample, DataLocation.Memory).pp());
    }
});
