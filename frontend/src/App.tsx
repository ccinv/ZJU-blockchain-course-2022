import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { web3, SocietyCreditContract, StudentSocietyDAOContract } from "./utils/contracts/contracts";
import './App.css';

const GanacheTestChainId = '0x539'
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:7545'

function App() {
    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)
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
        const getSocietyCreditContractInfo = async () => {
            if (StudentSocietyDAOContract) {
                // const ma = await SocietyCreditContract.methods.manager().call()
                // setManagerAccount(ma)
                // const pn = await SocietyCreditContract.methods.getPlayerNumber().call()
                // setPlayerNumber(pn)
                // const pa = await SocietyCreditContract.methods.PLAY_AMOUNT().call()
                // setPlayAmount(pa)
                // const ta = await SocietyCreditContract.methods.totalAmount().call()
                // setTotalAmount(ta)
            } else {
                alert('Contract not exists.')
            }
        }

        getSocietyCreditContractInfo()
    }, [])

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

  return (
      <div className='container'>
          <div className='main'>
              <h1>社团组织治理</h1>
              <Button onClick={onClaimTokenAirdrop}>领取学生币空投</Button>
            <div className='account'>
                {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                <div>当前用户拥有学生币数量：{account === '' ? 0 : accountBalance}</div>
            </div>
          </div>
      </div>
  );
}

export default App;
