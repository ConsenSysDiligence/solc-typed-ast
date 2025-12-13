pragma solidity 0.8.8;

struct S2 {
    uint x;
    uint y;
}

type MyType is uint256;

library Lib {

        enum E {
            A,
            B,
            C
        }

        struct S {
                uint[] nums;
                address a;
        }

        struct S1 {
                S s;
                mapping(uint=>uint) m;
                function () external f;
        }

        function f1(uint[] storage x) public {}
        function f2(mapping(uint => uint) storage x) public {}
        function f3(S memory s) public {}
        function f4(S1 storage s) public {}
        // why is this allowed?
        function f5(S storage s) external {}
        function f6(S calldata s) external {}
        function f7(address payable a) public {}
        function f8(function (address) external returns (bool) fn) external returns (bool) {}
        function f9(S2 memory x) external {}
        function f10(mapping(string => string) storage x) public {}
        function f11(uint[][][] storage x) public {}
        function f12(mapping(bytes => S[][]) storage x) public {}
        function f13(uint[][][] calldata x) public {}
        function f14(mapping(bytes => mapping(address => uint[])) storage x) public {}
        function f15(uint[2][] storage x) public {}
        function f16(uint[2][2] storage x) public {}
        function f17(uint[][2][] storage x) public {}
        function f18(uint[2][] memory x) public {}
        function f19(uint[2][2] memory x) public {}
        function f20(uint[][2][] memory x) public {}
        function f21(E e, D d) public {}
        function f22(MyType t) public {}
}

library L {
    function f(address caller, function (address) external returns (bool) funcName) internal returns (bool) {
        return funcName(caller);
    }
}

contract C {
    function (address) external returns (bool) public v;
    
    function cf(address caller, function (address) external returns (bool) funcName) external returns (bool) {
        return funcName(caller);
    }

    function lf(address caller) external {
        L.f(caller, v);
    }
}

/**
 * Note that structs can not participate as mapping keys,
 * therefore can not be subject of public variable getters arguments.
 * They can only appear as return types.
 */
contract D {
    struct S0 {
        address s;
    }

    struct S1 {
        uint x;
        uint y;
        S0 p;
    }

    struct S2 {
        bool b;
        S1 s;
        address a;
    }

    S2 public s2;
    S1 public s1;
    S0 public s0;

    function fnA(S2 memory _s2, S1 memory _s1, S0 memory _s0) public returns (S2 memory, S1 memory, S0 memory) {}
    function fnB(S2[] memory _s2, S1[] memory _s1, S0[] memory _s0) public returns (S2[] memory, S1[] memory, S0[] memory) {}

    enum E {
        A,
        B,
        C
    }
    
    function f20(uint[2] memory x) public {}
    function enumF(E e) public {}
}
