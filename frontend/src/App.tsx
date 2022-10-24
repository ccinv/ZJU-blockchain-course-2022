import {
    FieldTimeOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import { useEffect, useState, createElement } from 'react';
import { Button, Input, List, Divider, Space } from 'antd';
import { web3, SocietyCreditContract, StudentSocietyDAOContract } from "./utils/contracts/contracts";
// import * as moment from "momnent"
import './App.css';

const GanacheTestChainId = '0x539'
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:7545'
interface Proposal {
    index: number;
    name: string;
    startTime: number;
    duration: number;
    yes:number;
    no:number;
}

const IconText = ({ start, duration }: { start: number; duration:number }) => (
  <Space>
    {createElement(FieldTimeOutlined)}
    {new Date(start * 1000).toLocaleString()}
    {createElement(ArrowRightOutlined)}
    {new Date(start * 1000 + duration * 1000).toLocaleString()}
  </Space>
);

function App() {
    const [account, setAccount] = useState('')
    const [voteString, setVoteString] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)
    const [voteAmount, setVoteAmount] = useState(0)
    const [proposalAmount, setProposalAmount] = useState(0)
    const [proposalList, setProposalList] = useState<Proposal[]>([])
    const [duration, setDuration] = useState(0)
    const [costPerVote, setCostPerVote] = useState(0)
    // eslint-disable-next-line
    const [proposalInitCost, setProposalInitCost] = useState(0)
    const [chainMod, setChainMod] = useState(0)
    const [manager, setManager] = useState('')

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
                setChainMod(1 - chainMod)
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

                await StudentSocietyDAOContract.methods.newProposal(voteAmount, voteString, duration).send({
                    from: account
                })

                alert('You have advanced a proposal successfully')
                setChainMod(1 - chainMod)
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onVote = (yesno: boolean, index: number) => {
        return async (e: any) => {
            try {
                await SocietyCreditContract.methods.approve(StudentSocietyDAOContract.options.address, costPerVote).send({
                    from: account
                })

                await StudentSocietyDAOContract.methods.vote(index, yesno, costPerVote).send({
                    from: account
                })

                alert('You have voted successfully')
                setChainMod(1 - chainMod)
            } catch (error: any) {
                alert(error.message)
            }            
        }
    }

    useEffect(() => {
        // 获取总共的提案数目
        const updateProposalAmount = async () => {
            const pa = await StudentSocietyDAOContract.methods.getProposalNum().call()
            setProposalAmount(pa)
        }

        updateProposalAmount()

        const updateConsts = async() => {
            const a = await StudentSocietyDAOContract.methods.getCostPerVote().call()
            const b = await StudentSocietyDAOContract.methods.getProposalInitCost().call()
            const c = await StudentSocietyDAOContract.methods.getManager().call()
            setCostPerVote(a)
            setProposalInitCost(b)
            setManager(c)
            
        }
        updateConsts()

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
    }, [chainMod, account])

    useEffect(()=> {
        // 获取提案详细信息
        const updateProposalList = async () => {
            let ret: Proposal[] = []
            for (var i = proposalAmount; i >= 1; --i) {
                const name = await StudentSocietyDAOContract.methods.getName(i).call()
                const yes = await StudentSocietyDAOContract.methods.getYes(i).call()
                const no = await StudentSocietyDAOContract.methods.getNo(i).call()
                const startTime = await StudentSocietyDAOContract.methods.getStartTime(i).call()
                const duration = await StudentSocietyDAOContract.methods.getDuration(i).call()
                ret.push({index: i, name: name, startTime: startTime, duration: duration, yes: yes, no:no})
            }
            setProposalList(ret)
        }

        updateProposalList()
    }, [proposalAmount, chainMod])

    const isExpired = (item: Proposal) =>{
        return new Date().getTime() >= (BigInt(item.startTime) + BigInt(item.duration)) * BigInt(1000)
    }

    const onConclude = (index: number) =>{
        return async (e: any) => {
            try {
                await StudentSocietyDAOContract.methods.conclude(index).send({
                    from: account
                })

                alert('You have concluded successfully')
                setChainMod(1 - chainMod)
            } catch (error: any) {
                alert(error.message)
            }            
        }
    }

    return (
      <div className='App'>
          <div className='main'>
                <h1>社团组织治理</h1>
                <div className='account'>
                    {account === '' && <Button onClick={onClickConnectWallet}>连接Metamask钱包</Button>}
                    <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                    <div>当前用户拥有学生币数量：{account === '' ? 0 : accountBalance}</div>
                    <Button onClick={onClaimTokenAirdrop}>领取学生币空投</Button>
                </div>
                <Divider />
                <div className='give'>
                    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                    <Input onChange={(e)=>setVoteString(e.target.value)} placeholder="建议内容" />
                    <Space>
                    <Input type="number" onChange={(e)=>setVoteAmount(Number(e.target.value))} suffix="tokens" placeholder="投入的代币数" />
                    <Input onChange={(e)=>setDuration(Number(e.target.value))} suffix="s" placeholder="有效时间" />
                    <Button onClick={onGiveProposal}>提出建议</Button>
                    </Space>
                    </Space>
                </div>
                <Divider />
                <div className='proposals'>
                    <div>当前总建议数：{account === '' ? 0 : proposalAmount}</div>
                    <List
                      size="large"
                      bordered
                      dataSource={proposalList}
                      renderItem={item => (
                        <List.Item
                          actions={[<Button onClick={onVote(true, item.index)}>支持({item.yes})</Button>,
                                    <Button onClick={onVote(false, item.index)}>反对({item.no})</Button>,
                                    // eslint-disable-next-line
                                    account == manager && isExpired(item) && <Button onClick={onConclude(item.index)}>结算</Button>]}
                          style={{
                            backgroundColor: !isExpired(item) ? "#fedcbd" : ((item.yes>item.no)?"#d71345":"#bed742")
                          }}
                        >
                            <List.Item.Meta
                              title={item.name}
                              description={<IconText start={item.startTime} duration={item.duration}/>}
                            />
                        </List.Item>)}
                    />
                </div>
          </div>
      </div>
  );
}

export default App;
