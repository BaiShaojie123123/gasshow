import Web3 from 'web3';
import {networkDataList, NetworkData, NetworkId} from './NetworkData';


export function format_price(price: number): string {
    // 判断 price 是否小于 0，如果小于 0 则截取长度为前 5 位
    if (price < 1) {
        return price.toString().substring(0, 5);
    } else {
        // 截取小数点之前的字符串
        const parts = price.toString().split(".");
        if (parts.length > 0) {
            return parts[0];
        } else {
            return "";
        }
    }
}


// 将 networkDataList 写入 chrome.storage 中
chrome.storage.sync.set({networkDataList: networkDataList, selectedNetwork: NetworkId.ETH_MAIN, selectedNetworkStatus: true});
async function getGasPrice(netId: number, rpcUrl: string): Promise<number> {
    let price = 0
    try {
        console.log('rpcUrl: '+rpcUrl)
        let web3 = new Web3(rpcUrl);
        let gasPriceWei = await web3.eth.getGasPrice();
        let gasPriceGwei = parseFloat(web3.utils.fromWei(gasPriceWei, 'gwei')).toFixed(3);
        price =  parseFloat(gasPriceGwei);
        // 判断是否是选择的网络,如果是更新徽章文本
        // 从 Chrome storage 中获取当前选择的网络
        chrome.storage.sync.get(['selectedNetwork'], (result) => {
            if (result.selectedNetwork === netId) { // 判断是否是选择的网络
                //判断 price是否大于0 如果
                chrome.action.setBadgeText({ text:  format_price(price)}); // 更新徽章文本为当前 gas price 值
            }
        });
        return price
    }
    catch (error) {
        return price        //     return
    }
}

async function updateGasPrices() {
    const updatedNetworkDataList: NetworkData[] = [];

    for (const networkData of networkDataList) {
        const updatedGasPrice = await getGasPrice(networkData.chainId, networkData.rpcUrl);
        updatedNetworkDataList.push({...networkData, gasPrice: updatedGasPrice});
    }

    chrome.storage.sync.set({networkDataList: updatedNetworkDataList}, () => {
        console.log('NetworkDataList updated:', updatedNetworkDataList);
        chrome.runtime.sendMessage({type: 'networkDataList', data: updatedNetworkDataList});
    });
}


// 每分钟更新 networkDataList 中的 gasPrice
setInterval(updateGasPrices, 5000); // 每分钟更新一次 gasPrice

// 首次运行时立即更新 gasPrice
updateGasPrices();
