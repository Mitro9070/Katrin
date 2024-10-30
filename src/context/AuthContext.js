import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [currentPage, setCurrentPage] = useState('/');

    const login = (userData, userPermissions) => {
        setUser(userData);
        setPermissions(userPermissions);
    };

    const logout = () => {
        setUser(null);
        setPermissions({});
        setCurrentPage('/');
    };

    return (
        <AuthContext.Provider value={{ user, permissions, currentPage, setCurrentPage, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);