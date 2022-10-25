import Addresses from './contract-addresses.json'
import SocietyCredit from './abis/SocietyCredit.json'
import StudentNFT from './abis/StudentNFT.json'
import StudentSocietyDAO from './abis/StudentSocietyDAO.json'

const Web3 = require('web3');

// @ts-ignore
// 创建web3实例
// 可以阅读获取更多信息https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3
let web3 = new Web3(window.web3.currentProvider)

// 修改地址为部署的合约地址
const SocietyCreditAddress = Addresses.SocietyCredit
const SocietyCreditABI = SocietyCredit.abi
const StudentSocietyDAOAddress = Addresses.StudentSocietyDAO
const StudentSocietyDAOABI = StudentSocietyDAO.abi
const StudentNFTAddress = Addresses.StudentNFT
const StudentNFTABI = StudentNFT.abi

// 获取合约实例
const SocietyCreditContract = new web3.eth.Contract(SocietyCreditABI, SocietyCreditAddress);
const StudentSocietyDAOContract = new web3.eth.Contract(StudentSocietyDAOABI, StudentSocietyDAOAddress);
const StudentNFTContract = new web3.eth.Contract(StudentNFTABI, StudentNFTAddress);

// 导出web3实例和其它部署的合约
export { web3, SocietyCreditContract, StudentSocietyDAOContract, StudentNFTContract }
 
