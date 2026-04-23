import './App.css'
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { routes } from "./routes/routes";
import { AuthProvider } from './contexts/AuthContext';

function AppRoutes() {
  const routeElements = useRoutes(routes);
  return routeElements;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      </Router>
  )
}

export default App
