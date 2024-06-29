export const TranferEventAbi = {
  anonymous: false,
  inputs: [
    {
      indexed: true,
      name: "_from",
      type: "address",
    },
    {
      indexed: true,
      name: "_to",
      type: "address",
    },
    {
      indexed: false,
      name: "_value",
      type: "uint256",
    },
  ],
  name: "Transfer",
  type: "event",
};

export const AllocationVoteCastAbi = {
  anonymous: false,
  inputs: [
    {
      indexed: true,
      internalType: "address",
      name: "voter",
      type: "address",
    },
    {
      indexed: true,
      internalType: "uint256",
      name: "roundId",
      type: "uint256",
    },
    {
      indexed: false,
      internalType: "bytes32[]",
      name: "appsIds",
      type: "bytes32[]",
    },
    {
      indexed: false,
      internalType: "uint256[]",
      name: "voteWeights",
      type: "uint256[]",
    },
  ],
  name: "AllocationVoteCast",
  type: "event",
};

export const VoterRewardsClaimedAbi = {
  anonymous: false,
  inputs: [
    {
      indexed: true,
      internalType: "uint256",
      name: "cycle",
      type: "uint256",
    },
    {
      indexed: true,
      internalType: "address",
      name: "voter",
      type: "address",
    },
    {
      indexed: false,
      internalType: "uint256",
      name: "reward",
      type: "uint256",
    },
  ],
  name: "RewardClaimed",
  type: "event",
};

export const CleanifyChallengeAddedEvent = {
  anonymous: false,
  inputs: [
    {
      indexed: true,
      internalType: "uint256",
      name: "challengeId",
      type: "uint256",
    },
    {
      indexed: true,
      internalType: "address",
      name: "user",
      type: "address",
    },
  ],
  name: "ChallengeAdded",
  type: "event",
};
