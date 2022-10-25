import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'HTTP://172.31.96.1:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0xde813696623aceee73c258360405cc944d521db4e20267dfc1cd9f329ff250b6',
        '0x851fdb03d7ea4cc4834fcef51917d12bf902a10754b56c3bf9588976adb5d81d',
        '0x558ac260e0cae4125dd685d810f0de4466051467b9e8884c5535fbf7a1a4c88e',
        '0x843e829d1d6aad19579c36bdb0bd473d82337dff5cb5cb472e700394ddff2eb4',
        '0x6829e8f3f18996ff2f43fe84e76d173e74053cc33508d8efcc3e64e240fbf6fc'
      ]
    },
  },
};

export default config;
