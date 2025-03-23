import React from 'react';
import Navbar from './Components/NavBar';
import Home from './Components/Home';
import Sp from './Components/sp';
import Votsc from './Components/votsc';

function App() {
  return (
    <div className='w-full h-full'>
      <Navbar />
      <Home />
      <Sp />
      <Votsc />
    </div>
  );
}

export default App;
