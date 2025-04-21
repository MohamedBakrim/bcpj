import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrowserProvider } from 'ethers'; // Ethers v6 import

const Navbar = () => {
  const [isnav, setisnav] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      alert("MetaMask is not installed. Please install it to connect.");
    }
  };

  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setDropdownOpen(false);
  };

  return (
    <div>
      {isnav && <Navscroll />}
      <div className="absolute w-full h-16 z-[999] flex items-center justify-between px-[5vw]">
        <nav className="flex p-2 rounded-3xl justify-center space-x-10 w-full">
          <Link to="/" className="navtext">Home</Link>
          <Link to="/shop" className="navtext">Why Us</Link>
          <Link to="/contact-me" className="navtext">First Vote</Link>
          <Link to="/CreateVote" className="navtext">Create Vote</Link>
        </nav>

        {walletAddress ? (
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="bg-transparent border-2 border-purple-500 cursor-pointer shadow-lg shadow-purple-500 text-purple-800 px-4 py-2 rounded-md font-mono"
            >
              {truncateAddress(walletAddress)}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 rounded-md shadow-md z-50">
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 text-purple-500 hover:bg-purple-500 hover:text-white bg-white rounded-md transition-all duration-300 w-full text-left"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="shadow-lg shadow-purple-500 border-2 text-purple-500 px-4 py-2 rounded-md focus:bg-purple-950 border-purple-500 hover:scale-105 transition-all duration-300"
          >
            Connect
          </button>
        )}
      </div>
    </div>
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
            <Link to="/shop" className="navtext2">Why Us</Link>
            <Link to="/contact-me" className="navtext2">Contact Me</Link>
            <Link to="/CreateVote" className="navtext2">CreateVote</Link>
          </nav>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
