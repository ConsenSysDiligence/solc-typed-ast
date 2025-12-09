import {
    IntTypeId,
    AddressTypeId,
    BytesTypeId,
    StringTypeId,
    BoolTypeId,
    FixedBytesTypeId
} from "./ast";

export const uint256T = new IntTypeId(256, false);
export const uint8T = new IntTypeId(8, false);
export const bytes1T = new FixedBytesTypeId(1);
export const bytes20T = new FixedBytesTypeId(20);
export const bytes24T = new FixedBytesTypeId(24);
export const bytes32T = new FixedBytesTypeId(32);
export const addressT = new AddressTypeId(false);
export const bytesT = new BytesTypeId();
export const stringT = new StringTypeId();
export const boolT = new BoolTypeId();
