// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract StudentNFT is ERC721, IERC721Enumerable {
    address public manager;
    uint256 supply;

    mapping(uint256 => uint256) supplyMap;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        manager = msg.sender;
        supply = 0;
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
        supplyMap[supply] = tokenid;
        supply++;
    }

    function tokenOfOwnerByIndex(address owner, uint256 index) public view override returns (uint256) {
        return 0;  // not used
    }

    function totalSupply() external  view override returns (uint256) {
        return supply;
    }

    function tokenByIndex(uint256 index) external view override returns (uint256) {
        return supplyMap[index];
    }
}
