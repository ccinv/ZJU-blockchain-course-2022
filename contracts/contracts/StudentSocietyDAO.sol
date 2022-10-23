// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./SocietyCredit.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract StudentSocietyDAO {

    uint32 constant costPerVote = 100;
    uint32 constant proposalInitCost = 300;

    uint32 public proposalNum;

    event ProposalInitiated(uint32 proposalIndex);

    struct Proposal {
        uint32 index;      // index of this proposal
        address proposer;  // who make this proposal
        uint256 startTime; // proposal start time
        uint256 duration;  // proposal duration
        string name;       // proposal name

        uint32 yes;  // current number of tokens say yes
        uint32 no;  // current number of tokens say no
    }

    SocietyCredit public studentERC20;
    mapping(uint32 => Proposal) public proposals; // A map from proposal index to proposal


    constructor() {
        studentERC20 = new SocietyCredit("studentERC20", "STU");
        proposalNum = 0;
    }

    function newProposal(
        uint32 amount,
        string memory name,
        uint256 duration
    ) public returns (uint32 proposalIndex){
        if (amount < proposalInitCost)
            revert('insuffient token to make a proposal');

        studentERC20.transferFrom(msg.sender, address(this), amount);
        proposalNum = proposalNum + 1;
        proposals[proposalNum].index = proposalNum;
        proposals[proposalNum].proposer = msg.sender;
        proposals[proposalNum].yes = (amount - proposalInitCost) / costPerVote;
        proposals[proposalNum].no = 0;
        proposals[proposalNum].startTime = block.timestamp;
        proposals[proposalNum].duration = duration;
        proposals[proposalNum].name = name;

        emit ProposalInitiated(proposalNum);
        return proposalNum;
    }

    function vote(
        uint32 index,
        bool support,
        uint32 amount
    ) public {
        if (amount < costPerVote)
            revert('insuffient token to vote');
        if (index > proposalNum ||
            proposals[index].startTime + proposals[index].duration < block.timestamp)
            revert('the proposal is not found or expired');

        studentERC20.transferFrom(msg.sender, address(this), amount);
        if (support){
            proposals[index].yes += amount / costPerVote;
        } else {
            proposals[index].no += amount / costPerVote;
        }
    }

    function getProposalNum() external view returns (uint256) {
        return proposalNum;
    }

    function getStartTime(uint32 index) external view returns (uint256) {
        return proposals[index].startTime;
    }

    function getDuration(uint32 index) external view returns (uint256) {
        return proposals[index].duration;
    }

    function getName(uint32 index) external view returns (string memory){
        return proposals[index].name;
    }

    function getYes(uint32 index) external view returns (uint32){
        return proposals[index].yes;
    }

    function getNo(uint32 index) external view returns (uint32){
        return proposals[index].no;
    }
}
