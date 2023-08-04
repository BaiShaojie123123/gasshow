import React from 'react';
import {Button, TextField} from "@mui/material";
import {NetworkData} from "./NetworkData";

interface NetworkFormProps {
    network: NetworkData;
    handleNetworkChange: (updatedNetwork: NetworkData) => void;
    handleFormSubmit: () => void;
    submitButtonText: string;
}

export const NetworkForm: React.FC<NetworkFormProps> = ({
                                                            network,
                                                            handleNetworkChange,
                                                            handleFormSubmit,
                                                            submitButtonText
                                                        }) => {
    const handleChange = (field: keyof NetworkData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        handleNetworkChange({
            ...network,
            [field]: event.target.value,
        });
    };

    return (
        <form>
            <TextField label="Name" value={network.name} onChange={handleChange('name')}/>
            {/* Add other fields as needed */}
            <Button onClick={handleFormSubmit}>{submitButtonText}</Button>
        </form>
    );
};
