import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Components/NavBar';
import Home from './Components/Home';

import { AnimatePresence } from 'framer-motion';


function App() {
  const location = useLocation();
  return (
    <div>
      <AnimatePresence mode='wait'>
      <div style={{ overflow: 'hidden' }}>
        <Navbar className="absolute z-[999]" />
      </div>
      
        <Routes key={location.pathname} location={location} >
          <Route path="/" element={<Home />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;