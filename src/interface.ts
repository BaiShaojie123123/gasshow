import {NetworkData, NetworkId} from "./NetworkData";

export const getDefaultNetworkData = (): NetworkData => ({
    name: "",
    gasPrice: 0,
    chainId: NetworkId.ETH_MAIN,
    rpcUrl: "",
});