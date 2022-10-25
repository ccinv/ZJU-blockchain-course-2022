# Wevote

## 如何运行

1. 在本地启动ganache应用。

2. 在 `./contracts` 中安装需要的依赖，运行如下的命令：
    ```bash
    npm install
    ```
3. 在 `./contracts` 中编译并且部署合约，运行如下的命令：
    ```bash
    npx hardhat run scripts/deploy.ts --network ganache
    ```
4. 将输出的合约地址填到`./frontend/src/utils/contracts/contract-addresses.json`中，并在`./contracts/scripts` 中运行以下命令
    ```bash
    ./deployabi.sh
    ```
6. 在 `./frontend` 中启动前端程序，运行如下的命令：
    ```bash
    npm run start
    ```

## 功能实现分析

- **空投** 每个学生初始可以拥有或领取一些通证积分 。通过 ERC20 标准中的`_mint`实现，并通过一张`mapping`记录已经领过的地址，防止重复领取。
- **发起提案** 每个学生可以使用一定数量通证积分，发起关于该社团进行活动或制定规则的提案。通过实现一个`newProposal`，给定输入 token 数，提议内容和持续时间，实现在链上创建并记录这一条提案的具体信息。发起提案本身需要一定 token，剩下输入的 token 会按比例转化成赞成票。其中输入的 token 会通过 ERC20 的`approve`和`transferFrom`打入合约地址，提案会被记录在一个 `mapping`中。
- **投票** 提案发起后一定支出时间内，使用一定数量通证积分可以对提案进行投票（赞成或反对，限制投票次数）。实现了一个`vote`函数，它会在函数开始时对各项条件进行审查，比如是否超时，是否投票次数过多。然后就和发起提案类似，在合约内的`mapping`中记录相应的数据，并且把代币打进合约账户。
- **结算** 提案投票时间截止后，赞成数大于反对数的提案通过，提案发起者作为贡献者可以领取一定的积分奖励。实现了一个`conclude`函数，它首先会检查发起地址是不是管理员，然后检查这项提案是否已经过期，可以关闭，并且检查提案是否已经关闭过了。如果都满足条件，则会在这项提案中打上`conculded = true`标签，并且把之前打进的代币奖励给提案发起者，具体分配是把所有票数一半对应的 token（发起提案本身不算）交给提案发起者，另一半（包含发起提案部分）打入空地址`0x0000dead`。
- **纪念品** 发起提案并通过3次的学生，可以领取社团颁发的纪念品。这部分也是在结算函数内完成的，在合约内另建了一张`mapping`用来存放每个地址发起提案成功次数，并且每三次成功合约就会用`ERC721`标准中的`_mint`铸造一个随机 NFT 给提案者做纪念。

## 项目运行截图

- 未连接钱包时

![](https://raw.githubusercontent.com/ccinv/ZJU-blockchain-course-2022/main/assets/Snipaste_2022-10-25_19-29-15.png)

- 连接钱包后

![](https://raw.githubusercontent.com/ccinv/ZJU-blockchain-course-2022/main/assets/Snipaste_2022-10-25_19-29-57.png)

- 领取空投后

![](https://raw.githubusercontent.com/ccinv/ZJU-blockchain-course-2022/main/assets/Snipaste_2022-10-25_19-30-28.png)

- 提出建议的界面

![](https://raw.githubusercontent.com/ccinv/ZJU-blockchain-course-2022/main/assets/Snipaste_2022-10-25_19-31-47.png)

- 成功提出建议

![](https://raw.githubusercontent.com/ccinv/ZJU-blockchain-course-2022/main/assets/Snipaste_2022-10-25_19-32-11.png)

- 成功投票

![](https://raw.githubusercontent.com/ccinv/ZJU-blockchain-course-2022/main/assets/Snipaste_2022-10-25_19-32-52.png)

- 截止时间到，进入待结算状态

![](https://raw.githubusercontent.com/ccinv/ZJU-blockchain-course-2022/main/assets/Snipaste_2022-10-25_19-33-06.png)

- 结算后，返还了一部分代币

![](https://raw.githubusercontent.com/ccinv/ZJU-blockchain-course-2022/main/assets/Snipaste_2022-10-25_19-33-20.png)

- 三次成功的提案，获赠一个 NFT（一个数字）

![](https://raw.githubusercontent.com/ccinv/ZJU-blockchain-course-2022/main/assets/Snipaste_2022-10-25_19-36-27.png)

## 参考内容

- 课程Demo https://github.com/LBruyne/blockchain-course-demos
- Decentralized Autonomous Organization (DAO) Framework https://github.com/blockchainsllc/DAO
- Solidity - Generate unpredictable random number that does not depend on inputhttps://stackoverflow.com/questions/58188832/solidity-generate-unpredictable-random-number-that-does-not-depend-on-input
- ERC721 OpenZeppelin Docs https://docs.openzeppelin.com/contracts/3.x/api/token/erc721
- totalsupply() is not a function openzeppelin contracts https://stackoverflow.com/questions/68810515/totalsupply-is-not-a-function-openzeppelin-contracts