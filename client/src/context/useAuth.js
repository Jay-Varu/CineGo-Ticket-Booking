import { useContext } from 'react';
import { AuthContext } from './contextValue';

export const useAuth = () => useContext(AuthContext);