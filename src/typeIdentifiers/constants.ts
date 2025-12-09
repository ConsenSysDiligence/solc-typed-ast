import { DataLocation } from "../ast/constants";
import {
    IntTypeId,
    AddressTypeId,
    BytesTypeId,
    StringTypeId,
    BoolTypeId,
    FixedBytesTypeId,
    PointerTypeId
} from "./ast";

export const uint256T = new IntTypeId(256, false);
export const uint8T = new IntTypeId(8, false);
export const int256T = new IntTypeId(256, true);
export const int8T = new IntTypeId(8, true);
export const bytes1T = new FixedBytesTypeId(1);
export const bytes2T = new FixedBytesTypeId(2);
export const bytes4T = new FixedBytesTypeId(4);
export const bytes20T = new FixedBytesTypeId(20);
export const bytes24T = new FixedBytesTypeId(24);
export const bytes32T = new FixedBytesTypeId(32);
export const addressT = new AddressTypeId(false);
export const bytesT = new BytesTypeId();
export const stringT = new StringTypeId();
export const memStringPtrT = new PointerTypeId(stringT, DataLocation.Memory, true);
export const memBytesPtrT = new PointerTypeId(bytesT, DataLocation.Memory, true);
export const boolT = new BoolTypeId();
