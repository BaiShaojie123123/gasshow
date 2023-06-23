import {NetworkData} from "./NetworkData";

export const getDefaultNetworkData = (): NetworkData => ({
    name: "",
    gasPrice: 0,
    chainId: 0,
    rpcUrl: "",
});