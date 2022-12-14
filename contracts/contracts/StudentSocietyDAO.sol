// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./SocietyCredit.sol";
import "./StudentNFT.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract StudentSocietyDAO {

    uint32 constant costPerVote = 100;
    uint32 constant proposalInitCost = 300;
    uint32 constant maxVoteTimes = 5;

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

        mapping(address => uint32) times;
        bool concluded;
    }

    SocietyCredit public studentERC20;
    StudentNFT public studentNFT;

    address public manager;
    mapping(uint32 => Proposal) public proposals; // A map from proposal index to proposal
    mapping(address => uint32) public passNum;


    constructor() {
        studentERC20 = new SocietyCredit("studentERC20", "STU");
        studentNFT = new StudentNFT("studentNFT", "STF");
        proposalNum = 0;
        manager = msg.sender;
    }

    modifier onlyManager {
        require(msg.sender == manager);
        _;
    }

    function rand()
        public
        view
        returns(uint256)
    {
        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.timestamp + block.difficulty +
            ((uint256(keccak256(abi.encodePacked(block.coinbase)))) / (block.timestamp)) +
            block.gaslimit + 
            ((uint256(keccak256(abi.encodePacked(msg.sender)))) / (block.timestamp)) +
            block.number
        )));

        return (seed - ((seed / 1000) * 1000));
    }

    function newProposal(
        uint32 amount,
        string memory name,
        uint256 duration
    ) public returns (uint32 proposalIndex){
        if (amount < proposalInitCost)
            revert('insuffient token to make a proposal');
        if (amount > proposalInitCost + maxVoteTimes * costPerVote)
            revert('too many votes');

        studentERC20.transferFrom(msg.sender, address(this), amount);
        proposalNum = proposalNum + 1;
        proposals[proposalNum].index = proposalNum;
        proposals[proposalNum].proposer = msg.sender;
        proposals[proposalNum].yes = (amount - proposalInitCost) / costPerVote;
        proposals[proposalNum].no = 0;
        proposals[proposalNum].startTime = block.timestamp;
        proposals[proposalNum].duration = duration;
        proposals[proposalNum].name = name;
        proposals[proposalNum].times[msg.sender] = proposals[proposalNum].yes;

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
        if (proposals[index].times[msg.sender] + amount / costPerVote > maxVoteTimes)
            revert('you have voted too many times');

        studentERC20.transferFrom(msg.sender, address(this), amount);
        if (support){
            proposals[index].yes += amount / costPerVote;
        } else {
            proposals[index].no += amount / costPerVote;
        }
        proposals[index].times[msg.sender] += amount / costPerVote;
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

    function isExpired(uint32 index) external view returns (bool){
        return block.timestamp >= proposals[index].startTime + proposals[index].duration;
    }

    function getCostPerVote() external pure returns (uint32){
        return costPerVote;
    }

    function getProposalInitCost() external pure returns (uint32){
        return proposalInitCost;
    }

    function getManager() external view returns(address){
        return manager;
    }

    function conclude(uint32 index) onlyManager public {
        require(block.timestamp >= proposals[index].startTime + proposals[index].duration &&
                !proposals[index].concluded);

        proposals[index].concluded = true;
        if (proposals[index].yes > proposals[index].no) {
            // reward the proposal owner
            studentERC20.transfer(proposals[index].proposer,
                (proposals[index].yes + proposals[index].no) * costPerVote / 2);
            studentERC20.transfer(address(0x0000dead),
                (proposals[index].yes + proposals[index].no) * costPerVote / 2 + proposalInitCost);
            passNum[proposals[index].proposer] ++;
            if (passNum[proposals[index].proposer] == 3){
                passNum[proposals[index].proposer] = 0;
                // issue a NFT
                studentNFT.mint(proposals[index].proposer, rand());
            }
        } else {
            // send to blackhole
            studentERC20.transfer(address(0x0000dead),
                (proposals[index].yes + proposals[index].no) * 100 + proposalInitCost);
        }
    }
}
