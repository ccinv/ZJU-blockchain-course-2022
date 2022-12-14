import { ethers } from "hardhat";

async function main() {
    const StudentSocietyDAO = await ethers.getContractFactory("StudentSocietyDAO");
    const studentSocietyDAO = await StudentSocietyDAO.deploy();
    await studentSocietyDAO.deployed();

    console.log(`StudentSocietyDAO deployed to ${studentSocietyDAO.address}`);

    const SocietyCredit = await studentSocietyDAO.studentERC20()
    console.log(`SocietyCredit contract has been deployed successfully in ${SocietyCredit}`)
    const StudentNFT = await studentSocietyDAO.studentNFT()
    console.log(`StudentNFT contract has been deployed successfully in ${StudentNFT}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
