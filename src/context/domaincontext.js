import React, { createContext, useContext, useState } from 'react';

const DomainContext = createContext();

export const DomainProvider = ({ children }) => {
    const [domain, setDomain] = useState(''); 

    return (
        <DomainContext.Provider value={{ domain, setDomain }}>
            {children}
        </DomainContext.Provider>
    );
};

export const useDomain = () => useContext(DomainContext);
