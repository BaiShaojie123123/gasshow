// 定义 NetworkData 对象
export interface NetworkData {
    name: string;
    gasPrice?: number;
    chainId: number;
    rpcUrl: string;
}

export const NETWORK_NAMES = {
    ETH_MAIN: 'ETH Main',
    Zks_Era: 'Zks Era',
    OPTIMISM: 'Optimism',
    BSC: 'Bsc Smart Chain',
    GOERLI: 'Goerli',
    POLYGON: 'Polygon',
    ARBITRUM: 'Arbitrum One',
    BASE_GOERLI:'Base Goerli',
    NAME_NETWORK_FANTOM_OPERA : 'Fantom Opera',
    Name_Network_Avalanche_Network_C_Chain : 'Avalanche C-Chain',
    LINEA_GOERLI_TEST_NETWORK : 'linea goerli',
};

export const NetworkId = {
    ETH_MAIN: 1,
    Zks_Era: 324,
    OPTIMISM: 10,
    BSC_MAIN: 56,
    GOERLI: 5,
    POLYGON: 137,
    ARBITRUM: 42161,
    BASE_GOERLI: 84531,
    Avalanche_Network_C_Chain : 43114,
    FANTOM_OPERA : 250,
    LINEA_GOERLI_TEST_NETWORK : 59140,
}


// 创建多个 NetworkData 对象
export const networkDataList: NetworkData[] = [
    {
        name: NETWORK_NAMES.ETH_MAIN,
        gasPrice: 0,
        chainId: NetworkId.ETH_MAIN,
        rpcUrl: 'https://eth-mainnet-public.unifra.io'
    },
    {
        name: NETWORK_NAMES.Zks_Era,
        gasPrice: 0,
        chainId: NetworkId.Zks_Era,
        rpcUrl: 'https://mainnet.era.zksync.io'
    },
    {
        name: NETWORK_NAMES.OPTIMISM,
        gasPrice: 0,
        chainId: NetworkId.OPTIMISM,
        rpcUrl: 'https://mainnet.optimism.io'
    },
    {
        name: NETWORK_NAMES.BSC,
        gasPrice: 0,
        chainId: NetworkId.BSC_MAIN,
        rpcUrl: 'https://bsc-dataseed.binance.org/'
    },
    {
        name: NETWORK_NAMES.ARBITRUM,
        gasPrice: 0,
        chainId: NetworkId.ARBITRUM,
        rpcUrl: 'https://arb1.arbitrum.io/rpc'
    },
    {
        name: NETWORK_NAMES.POLYGON,
        gasPrice: 0,
        chainId: NetworkId.POLYGON,
        rpcUrl: 'https://polygon-rpc.com'
    },
    {
        name: NETWORK_NAMES.NAME_NETWORK_FANTOM_OPERA,
        gasPrice: 0,
        chainId: NetworkId.FANTOM_OPERA,
        rpcUrl: 'https://rpc.ftm.tools/'
    },
    {
        name: NETWORK_NAMES.Name_Network_Avalanche_Network_C_Chain,
        gasPrice: 0,
        chainId: NetworkId.Avalanche_Network_C_Chain,
        rpcUrl: 'https://avalanche.public-rpc.com'
    },

    {
        name: NETWORK_NAMES.GOERLI,
        gasPrice: 0,
        chainId: NetworkId.GOERLI,
        rpcUrl: 'https://eth-goerli.api.onfinality.io/public'
    },
    {
        name: NETWORK_NAMES.LINEA_GOERLI_TEST_NETWORK,
        gasPrice: 0,
        chainId: NetworkId.LINEA_GOERLI_TEST_NETWORK,
        rpcUrl: 'https://rpc.goerli.linea.build'
    },
//
];