import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserData, GetUserData } from '~/lib/repositories/userDataRepository';
import { useAuthState } from './UserContext';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

interface UserDataContextType {
    userData: UserData | undefined;
    setUserData: React.Dispatch<React.SetStateAction<UserData | undefined>>;
}

export const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

interface UserDataProviderProps {
    children: ReactNode;
}

export function UserDataProvider({ children }: UserDataProviderProps) {
    const [userData, setUserData] = useState<UserData>();
    const { state } = useAuthState();
    useEffect(() => {
        console.log('userData')
        const getUserData = async (user: User) => {

            try {
                const userDataRecord = await GetUserData(user.uid);
                if (userDataRecord) {
                    setUserData(userDataRecord);
                }
            } catch (error) {
                alert("Erro na pagina");
            }
        }
        if (state.state === 'SIGNED_IN') {
            getUserData(state.currentUser);
        } else {
            setUserData(undefined);
        }

    }, [state])
    return (
        <UserDataContext.Provider value={{ userData, setUserData }}>
            {children}
        </UserDataContext.Provider>
    );
}

export function useUserData(): UserDataContextType {
    const context = useContext(UserDataContext);
    if (!context) {
        throw new Error('useUserData deve ser usado dentro de um UserDataProvider');
    }
    return context;
}