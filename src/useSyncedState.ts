import { useState, useEffect } from "react";

export function useSyncedState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
    const [state, setState] = useState<T>(defaultValue);

    useEffect(() => {
        chrome.storage.sync.get({ [key]: defaultValue }, (items) => {
            console.log('key:'+key)
            setState(items[key]);
        });
    }, [key, defaultValue]);

    const setSyncedState = (value: T) => {
        chrome.storage.sync.set({ [key]: value }, () => {
            setState(value);
        });
    };

    return [state, setSyncedState];
}
