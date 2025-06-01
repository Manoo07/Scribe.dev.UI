import React from "react";
import AppRoutes from "./routes/AppRoutes";
import {UserProvider} from './context/UserContext'

const App: React.FC = () => 
<UserProvider><AppRoutes /></UserProvider>;

export default App;
