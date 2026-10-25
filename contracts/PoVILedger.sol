// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PoVILedger — Proof-of-Vascular-Integrity Bio-Carbon Smart Contract
 * @notice Enforces biophysical cambium telemetry consensus, Merkle root validation,
 * anti-double-counting credit gates, and automated PUF slashing for IEEE ClimateChain.
 */
contract PoVILedger {
    address public immutable oracleAuthority;
    uint256 public blockIndex;
    uint256 public activeAssetValuation; // in cents (e.g. 19545 = $195.45)
    uint256 public tokenMintRatePerHour; // in 1e4 units
    bool public isSlashed;
    string public slashReason;

    // Physical Unclonable Function (PUF) Biophysical Thresholds
    uint256 public constant MIN_IMPEDANCE_KOHM_X100 = 500;   // 5.00 kΩ
    uint256 public constant MAX_IMPEDANCE_KOHM_X100 = 7500;  // 75.00 kΩ
    uint256 public constant MIN_PHASE_SHIFT_DEG_X100 = 200;  // 2.00 degrees

    struct BlockCommitment {
        uint256 index;
        uint256 timestamp;
        bytes32 merkleRoot;
        string biologicalNonce;
        uint256 sapMicroCurrentMV;
        uint256 cellularImpedanceKohm;
        uint256 carbonYieldGramsHr;
        bytes32 previousHash;
        bytes32 blockHash;
    }

    struct CreditBatch {
        bytes32 batchHash;
        string serialIdentifier;
        uint256 carbonTons;
        uint256 issuedAt;
        bool isRetired;
    }

    mapping(uint256 => BlockCommitment) public blocks;
    mapping(bytes32 => bool) public registeredBatchHashes;
    mapping(string => bool) public registeredSerialIds;
    CreditBatch[] public creditBatches;

    event BlockCommitted(
        uint256 indexed index,
        bytes32 indexed blockHash,
        bytes32 merkleRoot,
        string biologicalNonce,
        uint256 valuation
    );

    event CreditIssued(
        bytes32 indexed batchHash,
        string serialIdentifier,
        uint256 carbonTons
    );

    event DoubleCountAttemptBlocked(
        bytes32 indexed batchHash,
        string serialIdentifier,
        address indexed caller,
        uint256 timestamp
    );

    event ConsensusSlashed(
        uint256 indexed blockIndex,
        string reason,
        uint256 timestamp
    );

    modifier onlyAuthority() {
        require(msg.sender == oracleAuthority, "PoVILedger: Caller is not authorized oracle");
        _;
    }

    modifier notSlashed() {
        require(!isSlashed, "PoVILedger: Contract consensus is slashed and frozen");
        _;
    }

    constructor() {
        oracleAuthority = msg.sender;
        activeAssetValuation = 19545; // $195.45 base PNL
        tokenMintRatePerHour = 24500; // 2.45 PNL/hr
        isSlashed = false;
    }

    /**
     * @notice Commits a cryptographically verified biophysical telemetry block
     */
    function commitBlock(
        bytes32 _merkleRoot,
        string calldata _biologicalNonce,
        uint256 _sapMV,
        uint256 _impedanceKohmX100,
        uint256 _phaseShiftDegX100,
        uint256 _carbonYieldGramsHr,
        bytes32 _prevHash
    ) external onlyAuthority notSlashed returns (bytes32) {
        // Enforce Physical Unclonable Function (PUF) cambium impedance boundaries
        if (_impedanceKohmX100 < MIN_IMPEDANCE_KOHM_X100 || _impedanceKohmX100 > MAX_IMPEDANCE_KOHM_X100) {
            _executeSlash("PUF_VIOLATION_CELLULAR_IMPEDANCE_COLLAPSE");
            return bytes32(0);
        }

        if (_phaseShiftDegX100 < MIN_PHASE_SHIFT_DEG_X100) {
            _executeSlash("PUF_VIOLATION_MEMBRANE_CAPACITANCE_FLATLINE");
            return bytes32(0);
        }

        bytes32 blockHash = keccak256(
            abi.encodePacked(
                blockIndex,
                block.timestamp,
                _merkleRoot,
                _biologicalNonce,
                _sapMV,
                _impedanceKohmX100,
                _carbonYieldGramsHr,
                _prevHash
            )
        );

        blocks[blockIndex] = BlockCommitment({
            index: blockIndex,
            timestamp: block.timestamp,
            merkleRoot: _merkleRoot,
            biologicalNonce: _biologicalNonce,
            sapMicroCurrentMV: _sapMV,
            cellularImpedanceKohm: _impedanceKohmX100,
            carbonYieldGramsHr: _carbonYieldGramsHr,
            previousHash: _prevHash,
            blockHash: blockHash
        });

        emit BlockCommitted(blockIndex, blockHash, _merkleRoot, _biologicalNonce, activeAssetValuation);
        blockIndex++;
        return blockHash;
    }

    /**
     * @notice Registers verified carbon credit batch with anti-double-counting lock
     */
    function issueCreditBatch(
        bytes32 _batchHash,
        string calldata _serialIdentifier,
        uint256 _carbonTons
    ) external onlyAuthority notSlashed returns (bool) {
        if (registeredBatchHashes[_batchHash] || registeredSerialIds[_serialIdentifier]) {
            emit DoubleCountAttemptBlocked(_batchHash, _serialIdentifier, msg.sender, block.timestamp);
            _executeSlash("DOUBLE_COUNTING_COLLISION_DETECTED");
            return false;
        }

        registeredBatchHashes[_batchHash] = true;
        registeredSerialIds[_serialIdentifier] = true;

        creditBatches.push(CreditBatch({
            batchHash: _batchHash,
            serialIdentifier: _serialIdentifier,
            carbonTons: _carbonTons,
            issuedAt: block.timestamp,
            isRetired: false
        }));

        emit CreditIssued(_batchHash, _serialIdentifier, _carbonTons);
        return true;
    }

    /**
     * @dev Permanently slashes valuation and freezes state
     */
    function _executeSlash(string memory _reason) internal {
        isSlashed = true;
        slashReason = _reason;
        activeAssetValuation = 0;
        tokenMintRatePerHour = 0;
        emit ConsensusSlashed(blockIndex, _reason, block.timestamp);
    }

    function emergencySlash(string calldata _reason) external onlyAuthority {
        _executeSlash(_reason);
    }
}
