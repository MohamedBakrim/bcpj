import React from 'react';

const Sp = () => {
  return (
    <div className='w-full h-[500px] bg-black'>
      <div className='h-96'>
        <h1 className='text-purple-500 text-center text-6xl p-8 font-bold'>Why Us?</h1>
        <div className='flex flex-col md:flex-row space-x-10 p-10 w-full h-full'>
          {/* First Box */}
          <div className='w-full h-full md:h-auto rounded-md shadow-md bg-[#1a0b2e] flex-grow flex flex-col items-center justify-center p-6'>
            <span className='text-4xl text-purple-500 mb-4'>🔒</span>
            <h2 className='text-white text-2xl mb-4'>Security</h2>
            <p className='text-white text-lg'>
              Our platform provides end-to-end security using the latest encryption technologies, ensuring your vote is always safe.
            </p>
          </div>

          {/* Second Box */}
          <div className='w-full h-full md:h-auto rounded-md shadow-md bg-[#1a0b2e] flex-grow flex flex-col items-center justify-center p-6'>
            <span className='text-4xl text-purple-500 mb-4'>🌐</span>
            <h2 className='text-white text-2xl mb-4'>Transparency</h2>
            <p className='text-white text-lg'>
              Blockchain ensures transparency in every step of the voting process, allowing anyone to verify results.
            </p>
          </div>

          {/* Third Box */}
          <div className='w-full h-full md:h-auto rounded-md shadow-md bg-[#1a0b2e] flex-grow flex flex-col items-center justify-center p-6'>
            <span className='text-4xl text-purple-500 mb-4'>⚖️</span>
            <h2 className='text-white text-2xl mb-4'>Fairness</h2>
            <p className='text-white text-lg'>
              With our decentralized system, no one can manipulate the results, ensuring a fair election for everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sp;
