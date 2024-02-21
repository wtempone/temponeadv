import { MantineColorScheme } from '@mantine/core';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';


interface ColorSchemeContextType {
    colorScheme: MantineColorScheme;
    setColorCheme: React.Dispatch<React.SetStateAction<MantineColorScheme>>;
}

export const ColorSchemeContext = createContext<ColorSchemeContextType>({
    colorScheme: 'light',
    setColorCheme: () => {}
});

interface ColorSchemeContextProps {
    children: ReactNode;
}

export function ColorSchemeProvider({ children }: ColorSchemeContextProps) {
    const [colorScheme, onChange] = useState<MantineColorScheme>('light');
 
    return (
        <ColorSchemeContext.Provider value={{ colorScheme, setColorCheme: onChange }}>
            {children}
        </ColorSchemeContext.Provider>
    );
}

export function useColorScheme(): ColorSchemeContextType {
    const context = useContext(ColorSchemeContext);
    if (!context) {
        throw new Error('useUserData deve ser usado dentro de um UserDataProvider');
    }
    return context;
}