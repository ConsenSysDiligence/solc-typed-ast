import { TypeName } from "./type_name";

export class ElementaryTypeName extends TypeName {
    /**
     * Name of the type
     */
    name: string;

    /**
     * Can be set to `payable` if the type is `address`.
     * Otherwise the value is always `nonpayable`.
     */
    stateMutability: "nonpayable" | "payable";

    constructor(
        id: number,
        src: string,
        typeString: string,
        typeIdentifier: string | undefined,
        name: string,
        stateMutability: "nonpayable" | "payable" = "nonpayable",
        raw?: any
    ) {
        super(id, src, typeString, typeIdentifier, raw);

        this.name = name;
        this.stateMutability = stateMutability;
    }
}
