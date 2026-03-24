pragma solidity ^0.8.30;

/**
 * Enum
 * Doc
 */
enum EnumABC {
    /**
     * @notice A
     */
    A,
    /**
     * @dev B
     */
    B,
    C

    /**
     * Enum
     *  Dangling
     *   Doc
     */
}

contract Test {
    enum Status {
        /// @notice Active
        Active,
        /// @notice Inactive
        Inactive
    }

    /// @notice Permission levels
    enum Permission {
        /// Read permission
        Read,
        /// Write permission
        Write,
        /// Admin permission
        Admin
    }
}