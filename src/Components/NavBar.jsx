import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isnav, setisnav] = useState(false);
  useEffect(()=>{
    window.addEventListener('scroll',handlescroll)
  })

  const handlescroll = () => {
    const pageht = 50
    if (window.scrollY > pageht) {
      setisnav(true);
    }
    else {
      setisnav(false);
    }
  }
  return (
    <div>
      {isnav && <Navscroll />}
      <div className='bg-black w-full h-14 absolute z-[999]'>
        <div className='flex justify-between items-center h-16 ml-[10vw] mr-[10vw] border-b-2 border-white'>
          <div className='flex items-center'>
             </div>
          <nav className='flex space-x-10 items-center'>
            <Link to="/" className='navtext'>Home</Link>
            <Link to="/shop" className='navtext'>Shop</Link>
            <Link to="/contact-me" className='navtext'>Contact Me</Link>
            <Link to="/Product" className='navtext'>Product</Link>
          </nav>
          <button className='shadow-lg shadow-purple-500 border-2 text-purple-500 p-2 rounded-md border-purple-500 hover:scale-105 cursor-pointer  transition-all duration-500 '>Connect</button>
        </div>
      </div></div>

  );
}
function Navscroll() {
  return (
    <motion.div variants={{
      start:{y:-75,opacity:1},
      end:{y:0,opacity:1},
    }} initial="start" animate="end" exit="start" transition={{duration:0.4}} className='fixed z-[999] w-screen '>
      <div className='font-MAIN flex mt-5 justify-center h-16 '>
        <div className=' w-[30vw] h-full backdrop-blur-xl bg-[#eae2ffa6] rotate-2 border-2 border-white'>
          <nav className='flex space-x-10 justify-center'>
            <Link to="/" className='navtext3'>Home</Link>
            <Link to="/shop" className='navtext3'>Shop</Link>
            <Link to="/contact-me" className='navtext3'>Contact Me</Link>
            <Link to="/Product" className='navtext3'>Product</Link>
          </nav>
        </div>
      </div>
    </motion.div>
  )
};

export default Navbar;