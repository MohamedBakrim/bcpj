import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Components/NavBar';
import Home from './Components/Home';
import Sp from './Components/sp';
import Votsc from './Components/votsc';
import CreateVote from './Components/CreateVote';

function App() {
  return (
    <div className='w-full h-full'>

      <Routes>
        <Route path="/" element={
          <>
          <Navbar />
            <Home />
            <Sp />
            <Votsc />
          </>
        } />
        <Route path="/CreateVote" element={<CreateVote />} />
      </Routes>
    </div>
  );
}

export default App;
