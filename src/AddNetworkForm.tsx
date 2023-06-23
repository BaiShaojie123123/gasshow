import React from 'react';
import { NetworkForm } from './NetworkForm';
import { NetworkData } from "./NetworkData";

interface AddNetworkFormProps {
    handleAddNetwork: (newNetwork: NetworkData) => void;
}

export const AddNetworkForm: React.FC<AddNetworkFormProps> = ({ handleAddNetwork }) => {
    const [newNetwork, setNewNetwork] = React.useState<NetworkData>({
        name: "",
        gasPrice: 0,
        chainId: 0,
        rpcUrl: "",
    });

    const handleFormSubmit = () => {
        handleAddNetwork(newNetwork);
    };

    return (
        <NetworkForm
            network={newNetwork}
            handleNetworkChange={setNewNetwork}
            handleFormSubmit={handleFormSubmit}
            submitButtonText="Add Network"
        />
    );
};
