import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [isnav, setisnav] = useState(false);

  const handlescroll = () => {
    const pageht = 50;
    if (window.scrollY > pageht) {
      setisnav(true);
    } else {
      setisnav(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handlescroll);
    return () => {
      window.removeEventListener('scroll', handlescroll);
    };
  }, []);

  return (
    <div>
      {isnav && <Navscroll />}
      <div className="absolute w-full h-16 z-[999] flex items-center justify-between px-[5vw]">
        <nav className="flex p-2 rounded-3xl justify-center space-x-10 w-full">
          <Link to="/" className="navtext">Home</Link>
          <Link to="/shop" className="navtext">Shop</Link>
          <Link to="/contact-me" className="navtext">Contact Me</Link>
          <Link to="/Product" className="navtext">Product</Link>
        </nav>
        <button className="shadow-lg shadow-purple-500 border-2 text-purple-500 px-4 py-2 rounded-md focus:bg-purple-950 border-purple-500 hover:scale-105 transition-all duration-300">
          Connect
        </button>
      </div></div>
  );
};

const Navscroll = () => {
  return (
    <motion.div
      variants={{
        start: { y: -75, opacity: 1 },
        end: { y: 0, opacity: 1 },
      }}
      initial="start"
      animate="end"
      exit="start"
      transition={{ duration: 0.4 }}
      className="fixed z-[999] w-screen"
    >
      <div className="font-MAIN flex mt-5 justify-center h-[5vh]">
        <div className="bg-[#1a0b2e] rounded-xl w-[24vw] h-full">
          <nav className="flex p-2 rounded-3xl justify-center space-x-10 w-full">
            <Link to="/" className="navtext2">Home</Link>
            <Link to="/shop" className="navtext2">Shop</Link>
            <Link to="/contact-me" className="navtext2">Contact Me</Link>
            <Link to="/Product" className="navtext2">Product</Link>
          </nav>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
