import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';


const WalletAuthorization = () => {
    const spAbi = [
        "function getPoint(address) public view returns (uint256)"
    ];
    const minAllowPoint = ethers.toBigInt(48);

    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    // 检查钱包是否已连接
    const getProvider = () => {
        let provider;
        if (window.ethereum == null) {
            return null;
        } else {
            provider = new ethers.BrowserProvider(window.ethereum);
        }
        return provider;
    }

    useEffect(() => {
        const checkWalletConnection = async () => {
            let provider = getProvider();
            if (!provider) return;

            const accounts = await provider?.listAccounts();
            if (accounts?.length > 0) {
                setWalletAddress(accounts[0].address);
                setIsWalletConnected(true);
            }
        };

        checkWalletConnection();
    }, []);

    // 连接钱包
    const connectWallet = async () => {
        let provider = getProvider();
        if (!provider) return;

        const signer = await provider?.getSigner();
        if (signer) {
            setWalletAddress(signer.address);
            setIsWalletConnected(true);
        } else {
            alert('Failed to connect to wallet. Please try again.');
        }
    };

    const [option1, setOption1] = useState('');
    const [option2, setOption2] = useState('');
    const [authorized, setAuthorized] = useState({
        authorized: false,
        link: '',
        md5: '',
    });

    const [options2, setOptions2] = useState([]);
    const [apiData, setApiData] = useState({});
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await fetch('https://raw.githubusercontent.com/48Club/bsc-snapshots/refs/heads/develop/api.json');
                const data = await response.json();
                setApiData(data);
            } catch (error) {
                console.error('Failed to fetch API data:', error);
            }
        };

        fetchOptions();
    }, []);

    useEffect(() => {
        // 根据 Option 1 的选择更新 Option 2 的选项
        if (option1 && apiData[option1]) {
            const options = apiData[option1];
            const filteredOptions = options.length > 1
                ? options.slice(0, -1) // 不取最后一项
                : []; // 如果只有一项，则清空选项
            if (filteredOptions.length === 0) {
                setOption2('');
            }
            setOptions2(filteredOptions);
        } else {
            setOptions2([]);
        }
    }, [option1, apiData]);

    const handleAuthorize = async () => {
        if (!option1 || !option2) {
            alert('Please select both options before authorizing.');
            return;
        }

        // 获取对应数组的最后一个元素
        const lastArrayValue = apiData[option1]?.slice(-1)[0];
        if (!lastArrayValue) {
            alert('Invalid data for the selected options.');
            return;
        }

        // 拼接目标字符串
        const patchFile = `${option1}${option2}_to_${lastArrayValue}.patch`;
        const tt = parseInt(Date.now() / 1000 + 24 * 60 * 60);
        let msg = JSON.stringify({
            file: patchFile,
            tt: tt,
        })

        try {
            let provider = getProvider();
            if (!provider) return;

            let signer = await provider?.getSigner();
            if (!signer) {
                return alert('Failed to connect to wallet. Please try again.');
            }

            const spContract = new ethers.Contract("0x928dC5e31de14114f1486c756C30f39Ab9578A92", spAbi, provider);
            let point = await spContract.getPoint(signer.address);
            if (point < minAllowPoint) {
                return alert('This feature is only available to users with at least 48 points.');
            }

            let sign = await signer.signMessage(msg)

            setAuthorized({
                authorized: true,
                link: `https://incremental.snapshots.48.club/?sig=${sign}&file=${patchFile}&tt=${tt}`,
                md5: apiData[patchFile],
            });
        } catch (error) {
            setAuthorized(false);
            alert('An error occurred during authorization: ' + error.message);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>48Club Access Tools</h1>
            {!isWalletConnected ? (
                <button onClick={connectWallet} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    Connect Wallet
                </button>
            ) : (
                <p>Connected Wallet: {walletAddress}</p>
            )}
            <div style={{ marginBottom: '15px' }}>
                <label>
                    type:
                    <select
                        value={option1}
                        onChange={(e) => setOption1(e.target.value)}
                        style={{ marginLeft: '10px' }}
                    >
                        <option value="">Select an option</option>
                        <option value="geth_fast_">geth fast node</option>
                        <option value="geth_full_">geth full node</option>
                        <option value="erigon_">erigon fast node</option>
                    </select>
                </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>
                    your version:
                    <select
                        value={option2}
                        onChange={(e) => setOption2(e.target.value)}
                        style={{ marginLeft: '10px' }}
                    >
                        <option value="">Select an option</option>
                        {options2.map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {isWalletConnected && (
                <button onClick={handleAuthorize} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    Patch
                </button>
            )}

            {authorized.authorized && (
                <div style={{ marginTop: '20px' }}>
                    <p>Signature successful! Access your resource here:</p>
                    <a href={authorized.link} target="_blank" rel="noopener noreferrer">
                        {authorized.link}
                    </a>
                    <p>MD5: {authorized.md5}</p>
                </div>
            )}
        </div>
    );
};

export default WalletAuthorization;
