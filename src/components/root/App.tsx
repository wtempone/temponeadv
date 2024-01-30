import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "~/components/contexts/UserContext";
import Main from "~/components/root/Main";
import './App.css'
import { UserDataProvider } from "../contexts/UserDataContext";
export const App = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <UserDataProvider>
          <Main />
        </UserDataProvider>
      </AuthProvider>
    </HelmetProvider>
  )
};
