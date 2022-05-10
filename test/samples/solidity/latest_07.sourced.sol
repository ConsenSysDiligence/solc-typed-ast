// ------------------------------------------------------------
// test/samples/solidity/latest_07.sol
// ------------------------------------------------------------
pragma solidity ^0.7.0;
pragma abicoder v2;

struct Job {
    uint priority;
    string name;
    bool executed;
}

/// @dev File-level constant feature
uint constant SIZE = 2;

function min(uint x, uint y) pure returns (uint) {
    return (x < y) ? x : y;
}

function sum(uint[] storage items) view returns (uint s) {
    for (uint i = 0; i < items.length; i++) {
        s += items[i];
    }
}

library Lib {
    function add(uint a, uint b) internal pure returns (uint) {
        return (a + b);
    }
}

contract A {
    using Lib for uint256;

    uint[] internal nums = [1, 2, 3];

    constructor() {}

    function testVariousStringLiterals() public {
        string memory a = "\u0000\u0001\u0002";
        string memory b = unicode"😃";
        string memory c = hex"000102";
        bytes memory d = hex"ffcc33";
    }

    function callFreeFunctions() public {
        assert(min(1, 3) == 1);
        assert(sum(nums) == 6);
    }
}

contract B is A {
    using Lib for uint256;
}

contract EventWithFuncParam {
    event Some(function(uint) external pure returns (uint) indexed fn);

    function x(uint a) public pure returns (uint b) {
        b = a * 10;
    }

    function verify() public {
        emit Some(this.x);
    }
}

contract Sample {
    uint public v;

    constructor(uint _v) {
        v = _v;
    }
}

contract DecodingContractType {
    function encode() internal returns (bytes memory) {
        Sample[] memory a = new Sample[](SIZE);
        for (uint i = 0; i < SIZE; i++) {
            a[i] = new Sample(i * 10);
        }
        return abi.encode(a);
    }

    function verify() public {
        bytes memory data = encode();
        Sample[] memory a = abi.decode(data, (Sample[]));
        assert(a.length == SIZE);
        for (uint i = 0; i < SIZE; i++) {
            assert(a[i].v() == (i * 10));
        }
    }
}

contract Scheduler {
    function schedule(Job[] calldata _jobs) public {
        for (uint i = 0; i < _jobs.length; i++) {
            executeJob(_jobs[i]);
        }
    }

    function executeJob(Job memory _job) internal {
        _job.executed = true;
    }
}

contract Proxy {
    address internal target;

    fallback(bytes calldata _input) external returns (bytes memory) {
        (bool success, bytes memory result) = target.delegatecall(_input);
        if (success) {
            return result;
        } else {
            revert(string(result));
        }
    }
}
