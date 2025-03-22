import React from 'react';
import bgVideo from '../assets/videos/bg.mp4';

const Home = () => {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center text-center">

      <video 
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay 
        loop 
        muted
        playsInline 
      >
        <source src={bgVideo} type="video/mp4" />
      </video>

      <div className="absolute top-0 left-0 w-full h-full bg-black/50"></div>

      <div className="relative z-10">
        <div className="text-5xl font-extrabold flex space-x-3 justify-center">
          <h1 className='text-white'>Welcome to </h1> 
          <h1 className='text-purple-500  drop-shadow-lg'>VoteX</h1>
        </div>
        
        <p className="text-white text-lg mt-2 max-w-2xl mx-auto">Empowering secure, transparent, and decentralized voting with blockchain technology.</p>
      </div>
    </div>
  );
};

export default Home;
