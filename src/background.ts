import Web3 from 'web3';
import { networkDataList, NetworkData } from './NetworkData';

export function formatPrice(price: number | undefined): string {
    if (price !== undefined && price < 1) {
        return price.toString().substring(0, 5);
    } else if (price !== undefined) {
        const parts = price.toString().split(".");
        if (parts.length > 0) {
            return parts[0];
        } else {
            return "";
        }
    } else {
        return "";
    }
}

export async function getGasPrice(netId: number, rpcUrl: string): Promise<number> {
    try {
        const web3 = new Web3(rpcUrl);
        const gasPriceWei = await web3.eth.getGasPrice();
        const gasPriceGwei = parseFloat(web3.utils.fromWei(gasPriceWei, 'gwei')).toFixed(3);
        const price = parseFloat(gasPriceGwei);

        return new Promise((resolve) => {
            chrome.storage.sync.get(['selectedNetworkId'], (result) => {
                if (result.selectedNetwork === netId) {
                    chrome.action.setBadgeText({ text: formatPrice(price) });
                }
                resolve(price);
            });
        });
    } catch (error) {
        console.error(error);
        return 0;
    }
}

// 检查网络id是否已经存在
export const checkNetworkIdExists = (networkId: number,networks:NetworkData[]): boolean => {
    for (let i = 0; i < networks.length; i++) {
        if (networks[i].chainId == networkId) {
            return true;
        }
    }
    return false;
}


export async function getSavedNetworks(needGasPrice: boolean = false): Promise<NetworkData[]> {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['networks'], async (result) => {
            if (result.networks && result.networks.length > 0) {
                if (needGasPrice) {
                    resolve(result.networks as NetworkData[]);
                } else {
                    const filteredNetworks = filterGasPrice(result.networks);
                    resolve(filteredNetworks);
                }
            } else {
                const savedNetworks = localStorage.getItem('networks');
                if (savedNetworks) {
                    const parsedNetworks = JSON.parse(savedNetworks) as NetworkData[];
                    if (needGasPrice) {
                        resolve(parsedNetworks);
                    } else {
                        const filteredNetworks = filterGasPrice(parsedNetworks);
                        resolve(filteredNetworks);
                    }
                } else {
                    const defaultNetworks = needGasPrice ? networkDataList : filterGasPrice(networkDataList);
                    resolve(defaultNetworks);
                }
            }
        });
    });
}
// ...

export async function setDefaultNetworkId(networkId: number): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ selectedNetworkId: networkId }, () => {
            updateGasPrices();
            handleBadgeUpdate(networkId);
            resolve();
        });
    });
}
const handleBadgeUpdate = (networkId: number) => {
    const selectedNetworkData = networkDataList.find(
        (network) => network.chainId === networkId
    );
    if (selectedNetworkData) {
        const gasPrice = selectedNetworkData.gasPrice;
        chrome.action.setBadgeText({text: formatPrice(gasPrice)});
    }
};
// ...

function filterGasPrice(networks: NetworkData[]): NetworkData[] {
    return networks.map((network) => {
        const { gasPrice, ...networkWithoutGasPrice } = network;
        return networkWithoutGasPrice;
    });
}

export const saveNetworkDataList = (networkDataList: NetworkData[]): void => {
    const orderedNetworkDataList: NetworkData[] = [];

    networkDataList.forEach((network) => {
        const foundNetwork = networkDataList.find((item) => item.chainId === network.chainId);
        if (foundNetwork) {
            orderedNetworkDataList.push(foundNetwork);
        }
    });

    chrome.storage.sync.set({ networks: orderedNetworkDataList }, () => {
        console.log('NetworkDataList saved:', orderedNetworkDataList);
    });
};

export const saveNetworks = async (networks: NetworkData[]): Promise<void> => {
    // 过滤掉 gasPrice 字段，保存到 localStorage
    const filteredNetworks = networks.map((network) => {
        const { gasPrice, ...networkWithoutGasPrice } = network;
        return networkWithoutGasPrice;
    });

    localStorage.setItem('networks', JSON.stringify(filteredNetworks));
    // 保存完整的网络信息到 chrome.storage
    saveNetworkDataList(networks);
};

export const updateGasPrices = async (): Promise<void> => {
    const networkDataList = await getSavedNetworks(true);

    const updatedNetworks = await Promise.all(
        networkDataList.map(async (network) => {
            const updatedGasPrice = await getGasPrice(network.chainId, network.rpcUrl);
            network.gasPrice = updatedGasPrice;
            return network;
        })
    );

    saveNetworkDataList(updatedNetworks);
};

// 定时器，每隔一段时间更新一次 gasPrice
setInterval(updateGasPrices, 500000);


