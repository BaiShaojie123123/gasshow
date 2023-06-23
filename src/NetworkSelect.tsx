import React from 'react';
import { FormControl, MenuItem, Select } from '@mui/material';
import { NetworkData } from './NetworkData';
import { SelectChangeEvent } from '@mui/material/Select';

interface NetworkSelectProps {
    networks: NetworkData[];
    selectedNetwork: number;
    handleNetworkChange: (event: SelectChangeEvent<number>) => void;
}

const NetworkSelect: React.FC<NetworkSelectProps> = ({ networks, selectedNetwork, handleNetworkChange }) => {
    return (
        <FormControl
            sx={{
                background: 'white',
                borderRadius: '20px',
                minWidth: '120px',
            }}
        >
            <Select
                labelId="network-select-label"
                id="network-select"
                value={selectedNetwork}
                sx={{
                    background: 'white',
                    borderRadius: '20px',
                    minWidth: '120px',
                    height: '36px',
                    '& .MuiSelect-root': {
                        padding: '6px',
                        fontSize: '14px',
                    },
                }}
                onChange={handleNetworkChange}
            >
                {networks.map((option) => (
                    <MenuItem key={option.chainId} value={option.chainId}>
                        {option.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default NetworkSelect;
