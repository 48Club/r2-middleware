import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const WalletAuthorization = () => {
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    // 检查钱包是否已连接
    useEffect(() => {
        const checkWalletConnection = async () => {
            let provider;
            if (window.ethereum == null) {
                console.log("MetaMask not installed; using read-only defaults")
                provider = ethers.getDefaultProvider()
            } else {
                provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0].address);
                    setIsWalletConnected(true);
                }
            }
        };

        checkWalletConnection();
    }, []);

    // 连接钱包
    const connectWallet = async () => {
        let provider;
        if (window.ethereum == null) {
            console.log("MetaMask not installed; using read-only defaults")
            provider = ethers.getDefaultProvider()
        } else {
            console.log("MetaMask installed; using injected Ethereum provider");
            provider = new ethers.BrowserProvider(window.ethereum);
        }
        const signer = await provider.getSigner();
        if (signer) {
            setWalletAddress(signer.address);
            setIsWalletConnected(true);
        } else {
            alert('Failed to connect to wallet. Please try again.');
        }
    };



    const [option1, setOption1] = useState('');
    const [option2, setOption2] = useState('');
    const [authorized, setAuthorized] = useState(false);
    const [link, setLink] = useState('');

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
            const filteredOptions = apiData[option1].length > 1
                ? apiData[option1].slice(0, 2) // 只取前两项
                : []; // 如果只有一项，则清空选项
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

        try {
            // Simulate a wallet authorization process
            const authorizationResult = await fakeWalletAuthorization(option1, option2);
            if (authorizationResult.success) {
                setAuthorized(true);
                setLink(authorizationResult.link);
                alert('Authorization successful!');
            } else {
                alert('Authorization failed. Please try again.');
            }
        } catch (error) {
            alert('An error occurred during authorization: ' + error.message);
        }
    };


    const fakeWalletAuthorization = async (option1, option2) => {
        // @TODO: 发起签名请求
        return { success: false, link: 'https://example.com/authorized-resource' }
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

                // <p>Connected Wallet: {walletAddress}</p>
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
                        <option value="geth.fast">geth fast node</option>
                        <option value="geth.full">geth full node</option>
                        <option value="erigon">erigon fast node</option>
                    </select>
                </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>
                    version:
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
                    Authorize
                </button>
            )}


            {authorized && (
                <div style={{ marginTop: '20px' }}>
                    <p>Authorization successful! Access your resource here:</p>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        {link}
                    </a>
                </div>
            )}
        </div>
    );
};

export default WalletAuthorization;
