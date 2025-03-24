import React from 'react';

const votsc = () => {
  return (
    <div className='w-vw bg-black h-[500px] py-15 px-10'>
      {/* Title */}
      <div className='text-[#a78bfa] text-center text-6xl py-10 font-bold'>
        Start Your First Vote
      </div>

      {/* Voting Cards Container */}
      <div className='flex w-full space-x-4'>
        {/* First Card */}
        <div className='w-full h-80 bg-[#1a0b2e] rounded-lg shadow-md p-5 border border-[#a78bfa]'>
          <h2 className='text-[#a78bfa] text-xl font-bold'>Vote Title</h2>
          <p className='text-gray-400 text-sm'>Short description...</p>
          <div className='mt-4'>
            <div className='flex justify-between items-center'>
              <span className='text-[#c084fc] text-lg font-bold'>Yes</span>
              <span className='text-white text-lg'>54%</span>
              <button className='bg-[#7c3aed] text-white px-4 py-1 rounded-md'>
                Buy Yes
              </button>
            </div>
            <div className='flex justify-between items-center mt-2'>
              <span className='text-[#9333ea] text-lg font-bold'>No</span>
              <span className='text-white text-lg'>46%</span>
              <button className='bg-[#581c87] text-white px-4 py-1 rounded-md'>
                Buy No
              </button>
            </div>
          </div>
          <p className='text-gray-500 text-xs mt-3'>$1.2M Vol.</p>
        </div>

        {/* Second Card */}
        <div className='w-full h-80 bg-[#1a0b2e] rounded-lg shadow-md p-5 border border-[#a78bfa]'>
          <h2 className='text-[#a78bfa] text-xl font-bold'>Another Vote</h2>
          <p className='text-gray-400 text-sm'>Description...</p>
          <div className='mt-4'>
            <div className='flex justify-between items-center'>
              <span className='text-[#c084fc] text-lg font-bold'>Yes</span>
              <span className='text-white text-lg'>60%</span>
              <button className='bg-[#7c3aed] text-white px-4 py-1 rounded-md'>
                Buy Yes
              </button>
            </div>
            <div className='flex justify-between items-center mt-2'>
              <span className='text-[#9333ea] text-lg font-bold'>No</span>
              <span className='text-white text-lg'>40%</span>
              <button className='bg-[#581c87] text-white px-4 py-1 rounded-md'>
                Buy No
              </button>
            </div>
          </div>
          <p className='text-gray-500 text-xs mt-3'>$850K Vol.</p>
        </div>

        {/* Third Card */}
        <div className='w-full h-80 bg-[#1a0b2e] rounded-lg shadow-md p-5 border border-[#a78bfa]'>
          <h2 className='text-[#a78bfa] text-xl font-bold'>Third Vote</h2>
          <p className='text-gray-400 text-sm'>Quick summary...</p>
          <div className='mt-4'>
            <div className='flex justify-between items-center'>
              <span className='text-[#c084fc] text-lg font-bold'>Yes</span>
              <span className='text-white text-lg'>72%</span>
              <button className='bg-[#7c3aed] text-white px-4 py-1 rounded-md'>
                Buy Yes
              </button>
            </div>
            <div className='flex justify-between items-center mt-2'>
              <span className='text-[#9333ea] text-lg font-bold'>No</span>
              <span className='text-white text-lg'>28%</span>
              <button className='bg-[#581c87] text-white px-4 py-1 rounded-md'>
                Buy No
              </button>
            </div>
          </div>
          <p className='text-gray-500 text-xs mt-3'>$500K Vol.</p>
        </div>
        <div className='w-full h-80 bg-[#1a0b2e] rounded-lg shadow-md p-5 border border-[#a78bfa]'>
          <h2 className='text-[#a78bfa] text-xl font-bold'>Third Vote</h2>
          <p className='text-gray-400 text-sm'>Quick summary...</p>
          <div className='mt-4'>
            <div className='flex justify-between items-center'>
              <span className='text-[#c084fc] text-lg font-bold'>Yes</span>
              <span className='text-white text-lg'>72%</span>
              <button className='bg-[#7c3aed] text-white px-4 py-1 rounded-md'>
                Buy Yes
              </button>
            </div>
            <div className='flex justify-between items-center mt-2'>
              <span className='text-[#9333ea] text-lg font-bold'>No</span>
              <span className='text-white text-lg'>28%</span>
              <button className='bg-[#581c87] text-white px-4 py-1 rounded-md'>
                Buy No
              </button>
            </div>
          </div>

          <p className='text-gray-500 text-xs mt-3'>$500K Vol.</p>
        </div>
      </div>
    </div>
  );
};

export default votsc;
