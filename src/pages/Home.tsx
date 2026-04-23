import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.js'; // Make sure to import your context
import LandingPage from './LandingPage';
import MainPage from './MainPage.js';

const Home = () => {

  const authContext = useContext(AuthContext);

  if (!authContext) {
    console.log("Nothing there")
     return null
  }
  
  const { user } = authContext;

  return user ? <MainPage /> : <LandingPage />;
};

export default Home;