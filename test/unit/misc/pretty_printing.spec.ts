import expect from "expect";
import { ASTNode, isPPAble, pp, ppArr, ppIter, ppMap, ppSet } from "../../../src";

describe("Utility formatting routines", () => {
    describe("isPPAble()", () => {
        const cases: Array<[any, boolean]> = [
            [{}, false],
            [[], false],
            [
                {
                    name: "test",
                    pp: () => "PPAble object"
                },
                true
            ]
        ];

        for (const [value, result] of cases) {
            it(`${JSON.stringify(value)} results ${result}`, () => {
                expect(isPPAble(value)).toEqual(result);
            });
        }
    });

    describe("pp()", () => {
        const cases: Array<[any, string]> = [
            [1, "1"],
            [BigInt(1), "1"],
            ["abc", "abc"],
            [true, "true"],
            [false, "false"],
            [null, "null"],
            [undefined, "<undefined>"],
            [
                {
                    name: "test",
                    pp: () => "PPAble object"
                },
                "PPAble object"
            ],
            [new ASTNode(1, "0:0:0", "CustomNode"), "CustomNode#1"]
        ];

        for (const [value, result] of cases) {
            it(`${
                typeof value === "bigint" ? value.toString() + "n" : JSON.stringify(value)
            } results ${result}`, () => {
                expect(pp(value)).toEqual(result);
            });
        }
    });

    describe("ppArr()", () => {
        const cases: Array<[any[], Array<string | undefined>, string]> = [
            [[1, 2, 3], [], "[1,2,3]"],
            [["x", "y", "z"], ["/", "<", ">"], "<x/y/z>"]
        ];

        for (const [value, options, result] of cases) {
            it(`${JSON.stringify(value)} with options ${JSON.stringify(
                options
            )} results ${result}`, () => {
                expect(ppArr(value, ...options)).toEqual(result);
            });
        }
    });

    describe("ppIter()", () => {
        function makeIterable<T>(...array: T[]): Iterable<T> {
            return {
                *[Symbol.iterator]() {
                    for (const element of array) {
                        yield element;
                    }
                }
            };
        }

        const cases: Array<[Iterable<any>, Array<string | undefined>, string]> = [
            [[1, 2, 3], [], "[1,2,3]"],
            [new Set(["x", "y", "z"]), ["/", "<", ">"], "<x/y/z>"],
            [makeIterable<any>("1x", 2, "y3"), [], "[1x,2,y3]"]
        ];

        for (const [value, options, result] of cases) {
            const array = Array.from(value);

            it(`Iterable ${JSON.stringify(array)} with options ${JSON.stringify(
                options
            )} results ${result}`, () => {
                expect(ppIter(value, ...options)).toEqual(result);
            });
        }
    });

    describe("ppSet()", () => {
        const cases: Array<[Set<any>, Array<string | undefined>, string]> = [
            [new Set([1, 2, 3]), [], "{1,2,3}"],
            [new Set(["x", "y", "z"]), ["/", "<", ">"], "<x/y/z>"]
        ];

        for (const [value, options, result] of cases) {
            it(`${JSON.stringify(value)} with options ${JSON.stringify(
                options
            )} results ${result}`, () => {
                expect(ppSet(value, ...options)).toEqual(result);
            });
        }
    });

    describe("ppMap()", () => {
        const map = new Map<string, number>([
            ["a", 0],
            ["b", 3],
            ["c", 1]
        ]);

        const cases: Array<[Map<any, any>, Array<string | undefined>, string]> = [
            [map, [], "{a:0,b:3,c:1}"],
            [map, ["/", " => ", "<", ">"], "<a => 0/b => 3/c => 1>"]
        ];

        for (const [value, options, result] of cases) {
            it(`${JSON.stringify(value)} with options ${JSON.stringify(
                options
            )} results ${result}`, () => {
                expect(ppMap(value, ...options)).toEqual(result);
            });
        }
    });
});
