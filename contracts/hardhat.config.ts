import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://172.31.192.1:7545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x0fde2b70556c575c56b96b38921d6ed0944efe18245a551edceae4dc04340419',
        '0x6a640c6a9b6667a99ad48eaf49683b7546d4c142f12f99b9a43120e9e1be0a78',
        '0x7e52723998ace1d5742b2348ea3bcbd77b2d17e9e5586905ab02c5601755c301',
        '0x35e4fa83e1aab75835c31032854b5ecf949f1993de3712adab64737f20268779',
        '0x579bc6f98fae26fa10b802a7565707c7eb036a04aa873410242fb1962417f8cc'
      ]
    },
  },
};

export default config;
