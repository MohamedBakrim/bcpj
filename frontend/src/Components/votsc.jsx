import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from "ethers";
import { contractABI, contractAddress } from "./Contract";

const Votsc = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 60000);
    return () => clearInterval(interval);
  }, []);

  // Function to initialize vote counts from localStorage
  const initializeVoteCountsFromLocalStorage = (pollsList) => {
    if (!pollsList || !Array.isArray(pollsList) || pollsList.length === 0) {
      return pollsList;
    }

    return pollsList.map(poll => {
      try {
        const storedVotes = localStorage.getItem(`poll_votes_${poll.id}`);
        if (storedVotes) {
          const parsedVotes = JSON.parse(storedVotes);
          if (Array.isArray(parsedVotes) && parsedVotes.length === poll.options.length) {
            console.log(`Initialized vote counts for poll ${poll.id} from localStorage:`, parsedVotes);
            return { ...poll, votes: parsedVotes };
          }
        }
      } catch (err) {
        console.error(`Error initializing vote counts for poll ${poll.id}:`, err);
      }
      return poll;
    });
  };

  // Function to fetch vote counts using localStorage
  const fetchVoteCounts = async (contract, pollId, optionsCount) => {
    try {
      console.log(`Fetching vote counts for poll ${pollId} with ${optionsCount} options`);

      // Initialize vote counts array
      const voteCounts = Array(optionsCount).fill(0);

      // Try to get vote counts from localStorage
      try {
        const storedVotes = localStorage.getItem(`poll_votes_${pollId}`);
        if (storedVotes) {
          const parsedVotes = JSON.parse(storedVotes);
          console.log(`Found stored votes for poll ${pollId}:`, parsedVotes);

          // Make sure the array is the right size
          if (Array.isArray(parsedVotes) && parsedVotes.length === optionsCount) {
            return parsedVotes;
          } else {
            console.log("Stored votes array size doesn't match options count, initializing new array");
          }
        }
      } catch (storageErr) {
        console.error("Error reading from localStorage:", storageErr);
      }

      // If we don't have stored votes, try to get them from events
      try {
        console.log("Trying to get votes from events...");

        // Create a filter for the Voted event
        const filter = {
          address: contract.target,
          topics: [
            ethers.id("Voted(uint256,uint256)")
          ]
        };

        // Get all events
        const logs = await contract.provider.getLogs({
          ...filter,
          fromBlock: 0,
          toBlock: "latest"
        });

        console.log(`Found ${logs.length} Voted events`);

        // Process each event
        for (const log of logs) {
          try {
            // Decode the event data
            const decodedData = contract.interface.parseLog({
              topics: log.topics,
              data: log.data
            });

            if (decodedData && decodedData.args) {
              const eventPollId = Number(decodedData.args[0]);
              const optionIndex = Number(decodedData.args[1]);

              console.log(`Event: Poll ${eventPollId}, Option ${optionIndex}`);

              // Only count votes for this poll
              if (eventPollId === pollId && optionIndex < optionsCount) {
                voteCounts[optionIndex]++;
              }
            }
          } catch (decodeErr) {
            console.error("Error decoding event:", decodeErr);
          }
        }

        console.log(`Vote counts for poll ${pollId} from events:`, voteCounts);

        // Store the vote counts in localStorage for future use
        try {
          localStorage.setItem(`poll_votes_${pollId}`, JSON.stringify(voteCounts));
        } catch (storageErr) {
          console.error("Error saving to localStorage:", storageErr);
        }
      } catch (eventsErr) {
        console.error("Error getting events:", eventsErr);
      }

      return voteCounts;
    } catch (err) {
      console.error(`Error fetching vote counts for poll ${pollId}:`, err);
      return Array(optionsCount).fill(0);
    }
  };

  // Fetch polls from blockchain
  useEffect(() => {
    const getPolls = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!window.ethereum) {
          setError("MetaMask not detected. Please install MetaMask to use this application.");
          setLoading(false);
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);

        try {
          await provider.send("eth_requestAccounts", []);
        } catch (err) {
          console.log("User rejected connection or not logged in");
          // Continue without connected account
        }

        const signer = await provider.getSigner().catch(() => provider);

        // Initialize contract
        let contract;
        try {
          contract = new ethers.Contract(contractAddress, contractABI, signer);

          // Debug contract object
          console.log("Contract object:", contract);
          console.log("Contract functions:", Object.keys(contract.functions || {}));
        } catch (contractErr) {
          console.error("Error initializing contract:", contractErr);
          setError(`Error initializing contract: ${contractErr.message}`);
          setLoading(false);
          return;
        }

        // Try to get all polls at once using getPolls
        const list = [];

        try {
          console.log("Calling getPolls...");
          let allPolls;

          if (contract.functions && contract.functions.getPolls) {
            allPolls = await contract.functions.getPolls();
          } else {
            allPolls = await contract.getPolls();
          }

          console.log("All polls:", allPolls);

          // Extract the polls array if needed
          let pollsArray = allPolls;
          if (!Array.isArray(allPolls) && allPolls[0]) {
            pollsArray = allPolls[0];
          }

          console.log("Polls array:", pollsArray);

          // Process each poll
          for (let i = 0; i < pollsArray.length; i++) {
            try {
              const poll = pollsArray[i];
              console.log(`Processing poll ${i}:`, poll);

              // Extract poll data
              let title, options, startTime, endTime;

              if (typeof poll === 'object') {
                // If poll is an object with properties
                title = poll.title;
                options = poll.options || [];
                startTime = poll.startTime;
                endTime = poll.endTime;
              } else if (Array.isArray(poll)) {
                // If poll is an array
                [title, options, startTime, endTime] = poll;
              }

              // Make sure options is an array
              if (!Array.isArray(options)) {
                options = [];
              }

              console.log(`Poll ${i} data:`, { title, options, startTime, endTime });

              // Fetch vote counts for this poll
              let votesRaw = options.map(() => 0);
              try {
                votesRaw = await fetchVoteCounts(contract, i, options.length);
              } catch (voteCountErr) {
                console.error(`Error fetching vote counts for poll ${i}:`, voteCountErr);
              }

              const start = Number(startTime);
              const end = Number(endTime);
              const active = now >= start && now <= end;

              // Calculate total votes
              const totalVotes = votesRaw.reduce((sum, count) => sum + count, 0);

              // Generate tags based on title
              const words = title.split(' ');
              const tags = [];
              if (words.length > 2) {
                // Use some words from the title as tags
                const potentialTags = words.filter(word => word.length > 3);
                for (let j = 0; j < Math.min(2, potentialTags.length); j++) {
                  const randomIndex = Math.floor(Math.random() * potentialTags.length);
                  tags.push(potentialTags[randomIndex]);
                }
              }

              // Add some generic tags if needed
              if (tags.length < 2) {
                const genericTags = ['Governance', 'Community', 'Proposal', 'Decision', 'Vote'];
                while (tags.length < 2) {
                  const randomTag = genericTags[Math.floor(Math.random() * genericTags.length)];
                  if (!tags.includes(randomTag)) {
                    tags.push(randomTag);
                  }
                }
              }

              // Calculate time left
              let timeLeft = '';
              if (now < start) {
                const daysToStart = Math.ceil((start - now) / 86400);
                timeLeft = `Starts in ${daysToStart} day${daysToStart !== 1 ? 's' : ''}`;
              } else if (now <= end) {
                const daysToEnd = Math.ceil((end - now) / 86400);
                timeLeft = `${daysToEnd} day${daysToEnd !== 1 ? 's' : ''} left`;
              } else {
                timeLeft = 'Ended';
              }

              list.push({
                id: i,
                title,
                description: `Vote on this poll with ${options.length} options.`,
                start,
                end,
                options,
                votes: votesRaw,
                active,
                totalVotes,
                tags,
                timeLeft,
                yesPercentage: options.length > 0 && totalVotes > 0 ? Math.round((votesRaw[0] / totalVotes) * 100) : 0,
                noPercentage: options.length > 1 && totalVotes > 0 ? Math.round((votesRaw[1] / totalVotes) * 100) : 0,
                volume: `$${(totalVotes * 100 + Math.floor(Math.random() * 900)).toLocaleString()}`
              });
            } catch (pollErr) {
              console.error(`Error processing poll ${i}:`, pollErr);
              // Continue to the next poll
            }
          }
        } catch (pollsErr) {
          console.error("Error getting polls:", pollsErr);

          // Fallback to using getTotalPolls and getPollOptions
          try {
            console.log("Falling back to getTotalPolls method...");
            let total = 0;

            if (contract.functions && contract.functions.getTotalPolls) {
              total = await contract.functions.getTotalPolls();
            } else if (contract.getTotalPolls) {
              total = await contract.getTotalPolls();
            } else if (contract.functions && contract.functions.pollCount) {
              total = await contract.functions.pollCount();
            } else if (contract.pollCount) {
              total = await contract.pollCount();
            }

            // Convert from BigInt if necessary
            if (typeof total !== 'number') {
              total = Number(total);
            }

            console.log("Total polls:", total);

            // Get each poll individually
            for (let i = 0; i < total; i++) {
              try {
                // Get poll from the polls mapping
                let pollData;
                if (contract.functions && contract.functions.polls) {
                  pollData = await contract.functions.polls(i);
                } else {
                  pollData = await contract.polls(i);
                }

                console.log(`Poll ${i} data:`, pollData);

                // Extract poll data
                let title, startTime, endTime, exists;

                if (Array.isArray(pollData)) {
                  [title, startTime, endTime, , exists] = pollData;
                } else {
                  title = pollData.title;
                  startTime = pollData.startTime;
                  endTime = pollData.endTime;
                  exists = pollData.exists;
                }

                // Skip if poll doesn't exist
                if (!exists) continue;

                // Get options
                let options = [];
                try {
                  if (contract.functions && contract.functions.getPollOptions) {
                    options = await contract.functions.getPollOptions(i);
                  } else {
                    options = await contract.getPollOptions(i);
                  }

                  // Extract options array if needed
                  if (!Array.isArray(options)) {
                    options = options[0] || [];
                  }
                } catch (optErr) {
                  console.error(`Error getting options for poll ${i}:`, optErr);
                }

                // Fetch vote counts for this poll
                let votesRaw = options.map(() => 0);
                try {
                  votesRaw = await fetchVoteCounts(contract, i, options.length);
                } catch (voteCountErr) {
                  console.error(`Error fetching vote counts for poll ${i}:`, voteCountErr);
                }

                const start = Number(startTime);
                const end = Number(endTime);
                const active = now >= start && now <= end;

                // Calculate total votes
                const totalVotes = votesRaw.reduce((sum, count) => sum + count, 0);

                // Generate tags based on title
                const words = title.split(' ');
                const tags = [];
                if (words.length > 2) {
                  // Use some words from the title as tags
                  const potentialTags = words.filter(word => word.length > 3);
                  for (let j = 0; j < Math.min(2, potentialTags.length); j++) {
                    const randomIndex = Math.floor(Math.random() * potentialTags.length);
                    tags.push(potentialTags[randomIndex]);
                  }
                }

                // Add some generic tags if needed
                if (tags.length < 2) {
                  const genericTags = ['Governance', 'Community', 'Proposal', 'Decision', 'Vote'];
                  while (tags.length < 2) {
                    const randomTag = genericTags[Math.floor(Math.random() * genericTags.length)];
                    if (!tags.includes(randomTag)) {
                      tags.push(randomTag);
                    }
                  }
                }

                // Calculate time left
                let timeLeft = '';
                if (now < start) {
                  const daysToStart = Math.ceil((start - now) / 86400);
                  timeLeft = `Starts in ${daysToStart} day${daysToStart !== 1 ? 's' : ''}`;
                } else if (now <= end) {
                  const daysToEnd = Math.ceil((end - now) / 86400);
                  timeLeft = `${daysToEnd} day${daysToEnd !== 1 ? 's' : ''} left`;
                } else {
                  timeLeft = 'Ended';
                }

                list.push({
                  id: i,
                  title,
                  description: `Vote on this poll with ${options.length} options.`,
                  start,
                  end,
                  options,
                  votes: votesRaw,
                  active,
                  totalVotes,
                  tags,
                  timeLeft,
                  yesPercentage: options.length > 0 && totalVotes > 0 ? Math.round((votesRaw[0] / totalVotes) * 100) : 0,
                  noPercentage: options.length > 1 && totalVotes > 0 ? Math.round((votesRaw[1] / totalVotes) * 100) : 0,
                  volume: `$${(totalVotes * 100 + Math.floor(Math.random() * 900)).toLocaleString()}`
                });
              } catch (pollErr) {
                console.error(`Error loading poll ${i}:`, pollErr);
              }
            }
          } catch (fallbackErr) {
            console.error("Error in fallback method:", fallbackErr);
            setError(`Error loading polls: ${fallbackErr.message}`);
          }
        }

        // Initialize vote counts from localStorage
        const initializedPolls = initializeVoteCountsFromLocalStorage(list);

        // Sort polls by total votes (descending)
        const sortedPolls = [...initializedPolls].sort((a, b) => {
          const totalVotesA = a.votes ? a.votes.reduce((sum, count) => sum + count, 0) : 0;
          const totalVotesB = b.votes ? b.votes.reduce((sum, count) => sum + count, 0) : 0;
          return totalVotesB - totalVotesA;
        });

        // Get the top 4 most popular polls
        setPolls(sortedPolls.slice(0, 4));
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to fetch polls. Please check your connection and try again.");
        setLoading(false);
      }
    };

    getPolls();
  }, [now, refreshCounter]);

  // Function to manually refresh polls
  const refreshPolls = () => {
    setLoading(true);
    setNow(Math.floor(Date.now() / 1000));
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <div id="first-vote" className='w-full py-20 bg-gradient-to-b from-[#0d0521] to-black'>
      <div className='container mx-auto px-4'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <h2 className='text-purple-400 text-5xl md:text-6xl font-bold mb-4'>Start Your First Vote</h2>
          <div className='w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mb-6'></div>
          <p className='text-gray-300 text-lg max-w-2xl mx-auto'>
            Explore trending polls or create your own to gather opinions on topics that matter to you
          </p>
          <button
            onClick={refreshPolls}
            className="mt-4 bg-[#2d1b4e] hover:bg-[#3d2b5e] text-purple-400 border border-purple-700 px-4 py-2 rounded-lg shadow-md transition-all duration-200 text-sm"
          >
            <span className="mr-2">🔄</span> Refresh Polls
          </button>
        </div>

        {/* Voting Cards Grid */}
        {loading ? (
          <div className='flex justify-center items-center py-16'>
            <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500'></div>
          </div>
        ) : error ? (
          <div className='bg-[#1a0b2e]/90 rounded-xl shadow-md p-8 text-center border border-red-500 backdrop-blur-sm max-w-lg mx-auto'>
            <div className='bg-[#2d1b4e] inline-block p-4 rounded-full mb-4'>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-red-400 mb-2'>Error Loading Polls</h3>
            <p className='text-gray-300 mb-4'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-lg transition-colors duration-200'
            >
              Try Again
            </button>
          </div>
        ) : polls.length === 0 ? (
          <div className='bg-[#1a0b2e]/90 rounded-xl shadow-md p-8 text-center border border-purple-700 backdrop-blur-sm max-w-lg mx-auto'>
            <div className='bg-[#2d1b4e] inline-block p-4 rounded-full mb-4'>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-purple-400 mb-2'>No Polls Available</h3>
            <p className='text-gray-300 mb-6'>Be the first to create a poll on our platform!</p>
            <Link to="/CreateVote" className='bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-lg shadow-md shadow-purple-900/50 transition-all duration-200'>
              Create a Poll
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {polls.map((poll) => (
              <div
                key={poll.id}
                className='bg-[#1a0b2e] rounded-xl shadow-lg p-6 border border-purple-700 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20 hover:border-purple-500 flex flex-col h-full'
              >
                {/* Card Header */}
                <div className='mb-4'>
                  <div className='flex justify-between items-start mb-2'>
                    <h3 className='text-purple-400 text-xl font-bold truncate'>{poll.title}</h3>
                    <div className='bg-purple-900/50 text-purple-300 text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2'>
                      {poll.timeLeft}
                    </div>
                  </div>
                  <p className='text-gray-400 text-sm mb-3 line-clamp-2'>{poll.description}</p>
                  <div className='flex flex-wrap gap-2 mb-3'>
                    {poll.tags && poll.tags.map((tag, index) => (
                      <span key={index} className='bg-[#2d1b4e] text-purple-300 text-xs px-2 py-1 rounded-full'>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Progress Bars */}
                <div className='mb-4 flex-grow'>
                  {poll.options && poll.options.length > 0 && (
                    <div className='mb-3'>
                      <div className='flex justify-between items-center mb-1'>
                        <span className='text-purple-300 font-medium truncate mr-2'>{poll.options[0]}</span>
                        <span className='text-gray-300 text-sm'>{poll.yesPercentage}%</span>
                      </div>
                      <div className='w-full bg-[#2d1b4e] rounded-full h-2.5'>
                        <div
                          className='bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 rounded-full'
                          style={{ width: `${poll.yesPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {poll.options && poll.options.length > 1 && (
                    <div>
                      <div className='flex justify-between items-center mb-1'>
                        <span className='text-purple-300 font-medium truncate mr-2'>{poll.options[1]}</span>
                        <span className='text-gray-300 text-sm'>{poll.noPercentage}%</span>
                      </div>
                      <div className='w-full bg-[#2d1b4e] rounded-full h-2.5'>
                        <div
                          className='bg-gradient-to-r from-purple-800 to-purple-600 h-2.5 rounded-full'
                          style={{ width: `${poll.noPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {poll.options && poll.options.length > 2 && (
                    <div className='text-center text-xs text-purple-400 mt-2'>
                      +{poll.options.length - 2} more options
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div>
                  <div className='flex justify-between items-center mb-4'>
                    <Link
                      to="/ShowPolls"
                      className='bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-lg transition-colors duration-200 text-center w-full'
                    >
                      Vote Now
                    </Link>
                  </div>
                  <div className='flex justify-between items-center'>
                    <p className='text-gray-400 text-xs'>Volume: {poll.volume || "$0"}</p>
                    <Link
                      to="/ShowPolls"
                      className='text-purple-400 hover:text-purple-300 text-sm transition-colors duration-200'
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className='mt-16 text-center'>
          <Link
            to="/CreateVote"
            className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg shadow-lg shadow-purple-900/30 transition-all duration-300 inline-block font-medium'
          >
            Create Your Own Poll
          </Link>
          <p className='text-gray-400 mt-4'>
            It only takes a minute to create your first blockchain-based poll
          </p>
        </div>

        {/* Features Section */}
        <div className='mt-20 grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='bg-[#1a0b2e]/80 rounded-xl p-6 border border-purple-900/50 backdrop-blur-sm'>
            <div className='bg-purple-900/50 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4'>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className='text-purple-400 text-xl font-bold mb-2'>Quick Setup</h3>
            <p className='text-gray-300'>
              Create a new poll in minutes with our intuitive interface. No technical knowledge required.
            </p>
          </div>

          <div className='bg-[#1a0b2e]/80 rounded-xl p-6 border border-purple-900/50 backdrop-blur-sm'>
            <div className='bg-purple-900/50 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4'>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className='text-purple-400 text-xl font-bold mb-2'>Real-time Results</h3>
            <p className='text-gray-300'>
              Watch as votes are recorded on the blockchain and see results update in real-time.
            </p>
          </div>

          <div className='bg-[#1a0b2e]/80 rounded-xl p-6 border border-purple-900/50 backdrop-blur-sm'>
            <div className='bg-purple-900/50 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4'>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className='text-purple-400 text-xl font-bold mb-2'>Community Engagement</h3>
            <p className='text-gray-300'>
              Engage with a community of voters and gather valuable insights on important topics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Votsc;
