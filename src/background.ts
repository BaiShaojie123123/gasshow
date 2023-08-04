import {NetworkData, networkDataList, NetworkId} from './NetworkData';

chrome.runtime.onInstalled.addListener(() => {
    // 打开popup页面
    chrome.tabs.create({url: chrome.runtime.getURL("popup.html")});
});


export function formatPrice(price: number | undefined): string {
    if (price !== undefined && price < 1) {
        // 如果小于0则 截取小数点后两位 4代表截取的长度 0.00 共4位
        return price.toString().substring(0, 4);
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

// 定义一个新的类型来表示从 Chrome 存储中获取的数据
interface StorageResult {
    selectedNetworkId?: number;
    networks?: NetworkData[];
}

function getFromChromeStorage(key: string): Promise<StorageResult> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result as StorageResult);
            }
        });
    });
}

export async function getGasPrice(netId: number, rpcUrl: string): Promise<number> {
    try {
        // 发送 HTTP 请求到自定义 RPC 服务器
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_gasPrice',
                params: [],
                id: netId,
            }),
        });

        // 处理返回的数据
        const data = await response.json();
        const gasPriceWei = parseInt(data.result, 16);
        // 16进制转化为Gwei = 1e9 toFixed(6) 保留6位小数
        const gasPriceGwei = (gasPriceWei / 1e9).toFixed(6);
        const price = parseFloat(gasPriceGwei);

        const result = await getFromChromeStorage('selectedNetworkId');
        if (result.selectedNetworkId === netId) {
            setBadgeText(price);
        }

        return price;
    } catch (error) {
        console.error(error);
        return 0;
    }
}

// 检查网络id是否已经存在
export const checkNetworkIdExists = (networkId: number, networks: NetworkData[]): boolean => {
    for (let i = 0; i < networks.length; i++) {
        if (networks[i].chainId == networkId) {
            return true;
        }
    }
    return false;
}

export async function getSavedNetworks(needGasPrice: boolean = false): Promise<NetworkData[]> {
    const result = await getFromChromeStorage('networks');

    if (result.networks && result.networks.length > 0) {
        if (needGasPrice) {
            return result.networks as NetworkData[];
        } else {
            const filteredNetworks = filterGasPrice(result.networks);
            return filteredNetworks;
        }
    } else {
        // 从chrome.storage.local获取数据并转化为Promise
        const savedNetworks = await new Promise((resolve) => {
            chrome.storage.local.get(['networks'], (result) => {
                resolve(result.networks);
            });
        });
        if (savedNetworks) {
            const parsedNetworks = JSON.parse(savedNetworks as string) as NetworkData[];
            if (needGasPrice) {
                return parsedNetworks;
            } else {
                const filteredNetworks = filterGasPrice(parsedNetworks);
                return filteredNetworks;
            }
        } else {
            const defaultNetworks = needGasPrice ? networkDataList : filterGasPrice(networkDataList);
            return defaultNetworks;
        }
    }
}


export async function setDefaultNetworkId(networkId: number): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.sync.set({selectedNetworkId: networkId}, () => {
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
        setBadgeText(selectedNetworkData.gasPrice);
    }
};

export const setBadgeText = (gasPrice: number | undefined) => {
    chrome.action.setBadgeText({text: formatPrice(gasPrice)});
};

// ...

function filterGasPrice(networks: NetworkData[]): NetworkData[] {
    return networks.map((network) => {
        const {gasPrice, ...networkWithoutGasPrice} = network;
        return networkWithoutGasPrice;
    });
}

function isPopupOpen() {
    const views = chrome.extension.getViews({type: 'popup'});
    return views.length > 0;
}

export const saveNetworkDataList = (networkDataList: NetworkData[]): void => {
    const orderedNetworkDataList: NetworkData[] = [];

    networkDataList.forEach((network) => {
        const foundNetwork = networkDataList.find((item) => item.chainId === network.chainId);
        if (foundNetwork) {
            orderedNetworkDataList.push(foundNetwork);
        }
    });
    // chrome.runtime.sendMessage({type: 'networkDataList', data: orderedNetworkDataList});
    chrome.storage.sync.set({networks: orderedNetworkDataList}, () => {
    });
};

export const saveNetworks = async (networks: NetworkData[]): Promise<void> => {
    // 过滤掉 gasPrice 字段，保存到 localStorage
    const filteredNetworks = networks.map((network) => {
        const {gasPrice, ...networkWithoutGasPrice} = network;
        return networkWithoutGasPrice;
    });

    localStorage.setItem('networks', JSON.stringify(filteredNetworks));
    // 保存完整的网络信息到 chrome.storage
    saveNetworkDataList(networks);
};

export const updateGasPrices = async () => {
    // 设置 10-100 的随机数
    const result = await getSavedNetworks();
    const selectedNetworkId = await getFromChromeStorage('selectedNetworkId');

    const updatedNetworks = await Promise.all(
        result.map(async (network) => {
            if (network.chainId !== selectedNetworkId.selectedNetworkId) {
                return network;
            }
            network.gasPrice = await getGasPrice(network.chainId, network.rpcUrl);
            return network
        })
    );
    saveNetworkDataList(updatedNetworks);
};

// 初始化
const init = async () => {
    const selectedNetworkId = await getFromChromeStorage('selectedNetworkId');
    // 判断是否有默认网络ID 如果没有则设置
    if (!selectedNetworkId.selectedNetworkId) {
        await setDefaultNetworkId(NetworkId.ETH_MAIN);
    }
}
init()

setInterval(updateGasPrices, 20000);
