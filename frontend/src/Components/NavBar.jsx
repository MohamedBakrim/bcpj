import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserProvider } from 'ethers'; // Ethers v6 import

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setWalletAddress(accounts[0].address);
          }
        } catch (err) {
          console.error("Error checking wallet connection:", err);
        }
      }
    };

    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);

        // Close mobile menu after connecting
        setMobileMenuOpen(false);
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

  // Handle scroll for navbar appearance and active link updates
  useEffect(() => {
    const handleScroll = () => {
      // Update navbar appearance
      setIsScrolled(window.scrollY > 50);

      // The state change will trigger a re-render, which will update active links
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Navigation links with scroll targets
  const navLinks = [
    { path: "/", label: "Home", isScroll: false },
    { scrollTarget: "why-us", label: "Why Us", isScroll: true },
    { scrollTarget: "first-vote", label: "First Vote", isScroll: true },
    { path: "/ShowPolls", label: "View Polls", isScroll: false },
    { path: "/CreateVote", label: "Create Poll", isScroll: false }
  ];

  // Function to check if a scroll link is active
  const isScrollLinkActive = (targetId) => {
    if (location.pathname !== '/') return false;

    // Check if we're at the home page and the section is in view
    const section = document.getElementById(targetId);
    if (!section) return false;

    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    // Consider the link active if the section is in the viewport
    return (
      rect.top <= windowHeight / 2 &&
      rect.bottom >= windowHeight / 2
    );
  };

  // Function to handle scroll to section
  const scrollToSection = (targetId) => {
    // Close mobile menu
    setMobileMenuOpen(false);

    // If we're not on the home page, navigate to home first
    if (location.pathname !== '/') {
      // Navigate to home and set a flag to scroll after navigation
      localStorage.setItem('scrollTarget', targetId);
      navigate('/');
      return;
    }

    // If we're already on the home page, scroll to the section
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check if we need to scroll after navigation
  useEffect(() => {
    if (location.pathname === '/') {
      const scrollTarget = localStorage.getItem('scrollTarget');
      if (scrollTarget) {
        // Small delay to ensure the page has loaded
        setTimeout(() => {
          const targetElement = document.getElementById(scrollTarget);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
          localStorage.removeItem('scrollTarget');
        }, 500);
      }
    }
  }, [location.pathname]);

  return (
    <>
      {/* Main Navbar */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#1a0b2e]/90 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 ">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                VoteX
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link, index) => (
                link.isScroll ? (
                  <button
                    key={`scroll-${index}`}
                    onClick={() => scrollToSection(link.scrollTarget)}
                    className={`text-base font-medium transition-all duration-300 hover:text-purple-400 bg-transparent border-0 cursor-pointer ${
                      isScrollLinkActive(link.scrollTarget)
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-base font-medium transition-all duration-300 hover:text-purple-400 ${
                      location.pathname === link.path
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>

            {/* Wallet Connection - Desktop */}
            <div className="hidden md:block">
              {walletAddress ? (
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-500/50 text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-800/40 transition-all duration-300"
                  >
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>{truncateAddress(walletAddress)}</span>
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-[#1a0b2e] border border-purple-500/30 rounded-lg shadow-xl overflow-hidden z-50"
                      >
                        <button
                          onClick={disconnectWallet}
                          className="w-full px-4 py-3 text-left text-gray-300 hover:bg-purple-800/40 hover:text-white transition-colors duration-200 flex items-center space-x-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Disconnect Wallet</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-gray-300 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#1a0b2e]/95 backdrop-blur-md border-b border-purple-900/30 md:hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link, index) => (
                  link.isScroll ? (
                    <button
                      key={`scroll-mobile-${index}`}
                      onClick={() => scrollToSection(link.scrollTarget)}
                      className={`text-base font-medium py-2 px-4 rounded-lg transition-all duration-300 text-left bg-transparent border-0 cursor-pointer ${
                        isScrollLinkActive(link.scrollTarget)
                          ? 'text-purple-400 bg-purple-900/30'
                          : 'text-gray-300 hover:bg-purple-900/20 hover:text-purple-400'
                      }`}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`text-base font-medium py-2 px-4 rounded-lg transition-all duration-300 ${
                        location.pathname === link.path
                          ? 'text-purple-400 bg-purple-900/30'
                          : 'text-gray-300 hover:bg-purple-900/20 hover:text-purple-400'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                ))}

                {/* Wallet Connection - Mobile */}
                <div className="pt-2 border-t border-purple-900/30">
                  {walletAddress ? (
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2 px-4 py-2 text-purple-300">
                        <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                        <span>{truncateAddress(walletAddress)}</span>
                      </div>
                      <button
                        onClick={disconnectWallet}
                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Disconnect Wallet</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={connectWallet}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-3 rounded-lg shadow-md flex items-center justify-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Connect Wallet</span>
                    </button>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
