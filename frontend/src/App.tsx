import { useEffect, useState } from 'react';
import { Button, Input, List } from 'antd';
import { web3, SocietyCreditContract, StudentSocietyDAOContract } from "./utils/contracts/contracts";
import './App.css';

const GanacheTestChainId = '0x539'
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:7545'
interface Proposal {
    name: string;
    startTime: number;
    duration: number;
    yes:number;
    no:number;
}

function App() {
    const [account, setAccount] = useState('')
    const [voteString, setVoteString] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)
    const [voteAmount, setVoteAmount] = useState(0)
    const [proposalAmount, setProposalAmount] = useState(0)
    const [proposalList, setProposalList] = useState<Proposal[]>([])

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {

                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
          }
      }

      initCheckAccounts()
    }, [])

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    useEffect(() => {
        const getAccountInfo = async () => {
            if (SocietyCreditContract) {
                const ab = await SocietyCreditContract.methods.balanceOf(account).call()
                setAccountBalance(ab)
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getAccountInfo()
        }
    }, [account])

    const onClaimTokenAirdrop = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (SocietyCreditContract) {
            try {
                await SocietyCreditContract.methods.airdrop().send({
                    from: account
                })
                alert('You have claimed ZJU Token.')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const onGiveProposal = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (SocietyCreditContract && StudentSocietyDAOContract) {
            try {
                await SocietyCreditContract.methods.approve(StudentSocietyDAOContract.options.address, voteAmount).send({
                    from: account
                })

                await StudentSocietyDAOContract.methods.newProposal(voteAmount, voteString, 10000000).send({
                    from: account
                })

                alert('You have voted successfully')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    useEffect(() => {
        // 获取总共的提案数目
        const updateProposalAmount = async () => {
            const pa = await StudentSocietyDAOContract.methods.getProposalNum().call()
            setProposalAmount(pa)
        }

      updateProposalAmount()
    }, [])

    useEffect(() => {
        // 获取提案详细信息
        const updateProposalList = async () => {
            let ret: Proposal[] = []
            for (var i = 1; i <= proposalAmount; ++i) {
                const name = await StudentSocietyDAOContract.methods.getName(i).call()
                const yes = await StudentSocietyDAOContract.methods.getYes(i).call()
                const no = await StudentSocietyDAOContract.methods.getNo(i).call()
                const startTime = await StudentSocietyDAOContract.methods.getStartTime(i).call()
                const duration = await StudentSocietyDAOContract.methods.getDuration(i).call()
                ret.push({name: name, startTime: startTime, duration: duration, yes: yes, no:no})
            }
            setProposalList(ret)
        }

      updateProposalList()
    }, [proposalAmount])

    return (
      <div className='container'>
          <div className='main'>
                <h1>社团组织治理</h1>
                <Button onClick={onClaimTokenAirdrop}>领取学生币空投</Button>
                <div className='give'>
                    <Input type="number" onChange={(e)=>setVoteAmount(Number(e.target.value))} placeholder="300" />
                    <Input onChange={(e)=>setVoteString(e.target.value)} placeholder="AAA" />
                    <Button onClick={onGiveProposal}>提出建议</Button>
                </div>
                <div className='account'>
                    {account === '' && <Button onClick={onClickConnectWallet}>连接Metamask钱包</Button>}
                    <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                    <div>当前用户拥有学生币数量：{account === '' ? 0 : accountBalance}</div>
                </div>
                <div className='proposals'>
                    <div>当前总共建议数：{account === '' ? 0 : proposalAmount}</div>
                    <List
                      size="large"
                      header={<div></div>}
                      footer={<div></div>}
                      bordered
                      dataSource={proposalList}
                      renderItem={item => (
                        <List.Item>
                            <p>{item.name}</p>
                            <p>{item.startTime}</p>
                            <p>{item.duration}</p>
                            <p>{item.yes}</p>
                            <p>{item.no}</p>
                        </List.Item>)}
                    />
                </div>
          </div>
      </div>
  );
}

export default App;
