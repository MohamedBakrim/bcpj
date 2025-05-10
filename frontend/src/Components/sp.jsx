import React from 'react';

const Sp = () => {
  const features = [
    {
      icon: '🔒',
      title: 'Security',
      description: 'Our platform provides end-to-end security using the latest encryption technologies, ensuring your vote is always safe.',
      gradient: 'from-purple-600 to-indigo-600'
    },
    {
      icon: '🌐',
      title: 'Transparency',
      description: 'Blockchain ensures transparency in every step of the voting process, allowing anyone to verify results.',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      icon: '⚖️',
      title: 'Fairness',
      description: 'With our decentralized system, no one can manipulate the results, ensuring a fair election for everyone.',
      gradient: 'from-indigo-600 to-blue-600'
    },
    {
      icon: '⚡',
      title: 'Speed',
      description: 'Get instant results as votes are recorded on the blockchain in real-time, eliminating lengthy counting processes.',
      gradient: 'from-purple-600 to-blue-600'
    }
  ];

  return (
    <div id="why-us" className='w-full py-20 bg-gradient-to-b from-black to-[#0d0521]'>
      <div className='container mx-auto px-4'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <h1 className='text-purple-400 text-5xl md:text-6xl font-bold mb-4'>Why Choose Us?</h1>
          <div className='w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mb-6'></div>
          <p className='text-gray-300 text-lg max-w-2xl mx-auto'>
            Our blockchain-based voting platform offers unique advantages that traditional voting systems can't match
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {features.map((feature, index) => (
            <div
              key={index}
              className='rounded-xl shadow-lg bg-[#1a0b2e] border border-purple-900/50 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-900/20'
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                <span className='text-3xl'>{feature.icon}</span>
              </div>
              <h2 className='text-purple-400 text-2xl font-bold mb-4'>{feature.title}</h2>
              <p className='text-gray-300 leading-relaxed'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className='mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
          <div className='bg-[#1a0b2e]/80 rounded-xl p-8 border border-purple-900/50 backdrop-blur-sm'>
            <div className='text-4xl font-bold text-purple-400 mb-2'>100%</div>
            <div className='text-xl text-gray-300'>Secure Transactions</div>
          </div>
          <div className='bg-[#1a0b2e]/80 rounded-xl p-8 border border-purple-900/50 backdrop-blur-sm'>
            <div className='text-4xl font-bold text-purple-400 mb-2'>24/7</div>
            <div className='text-xl text-gray-300'>Voting Availability</div>
          </div>
          <div className='bg-[#1a0b2e]/80 rounded-xl p-8 border border-purple-900/50 backdrop-blur-sm'>
            <div className='text-4xl font-bold text-purple-400 mb-2'>0%</div>
            <div className='text-xl text-gray-300'>Manipulation Risk</div>
          </div>
        </div>

        {/* Testimonial */}
        <div className='mt-20 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-8 md:p-12 border border-purple-700/50 backdrop-blur-sm'>
          <div className='flex flex-col items-center text-center'>
            <div className='text-purple-400 text-5xl mb-6'>❝</div>
            <p className='text-gray-200 text-xl md:text-2xl italic max-w-3xl mb-8'>
              VoteX has revolutionized our decision-making process. The transparency and security of blockchain voting have eliminated any concerns about vote manipulation.
            </p>
            <div className='flex items-center'>
              <div className='w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl'>
                JD
              </div>
              <div className='ml-4 text-left'>
                <div className='text-purple-300 font-semibold'>Jane Doe</div>
                <div className='text-gray-400 text-sm'>CEO, Tech Innovations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sp;
