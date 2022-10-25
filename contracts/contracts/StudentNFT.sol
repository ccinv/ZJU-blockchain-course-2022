// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StudentNFT is ERC721 {
    address public manager;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        manager = msg.sender;
    }

    function _baseURI() override internal pure returns (string memory) {
        return "http://127.0.0.1:3000/";
    }

    modifier onlyManager {
        require(msg.sender == manager);
        _;
    }
    function mint(address to, uint256 tokenid) public onlyManager {
        _mint(to, tokenid);
    }

}
