import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Components/NavBar';
import Footer from './Components/Footer';
import Home from './Components/Home';
import Sp from './Components/sp';
import Votsc from './Components/votsc';
import CreateVote from './Components/CreateVote';
import ShowPolls from './Components/ShowPolls';

function App() {
  return (
    <div className='w-full h-full'>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <>
            <Home />
            <Sp />
            <Votsc />
          </>
        } />
        <Route path="/CreateVote" element={<CreateVote />} />
        <Route path="/ShowPolls" element={<ShowPolls />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
