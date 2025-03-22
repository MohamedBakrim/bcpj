import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="fixed w-full h-16 z-[999] flex items-center justify-between px-[5vw] ">
      <nav className="flex p-2 rounded-3xl justify-center space-x-10 w-full">
        <Link to="/" className="navtext">Home</Link>
        <Link to="/shop" className="navtext">Shop</Link>
        <Link to="/contact-me" className="navtext">Contact Me</Link>
        <Link to="/Product" className="navtext">Product</Link>
      </nav>
      <button className="shadow-lg shadow-purple-500 border-2 text-purple-500 px-4 py-2 rounded-md focus:bg-purple-950 border-purple-500 hover:scale-105 transition-all duration-300">
        Connect
      </button>
    </div>
  );
};

export default Navbar;
