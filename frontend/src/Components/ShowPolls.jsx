import { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { contractABI, contractAddress } from "./Contract";

// Fallback contract address in case the imported one is incorrect
const FALLBACK_CONTRACT_ADDRESS = "0x13874b4f735765144c69109D70b557e5d776b796";

export default function ShowPolls() {
  const [polls, setPolls] = useState([]);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [userAddress, setUserAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingPollId, setVotingPollId] = useState(null);
  const [votingOptionIndex, setVotingOptionIndex] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Update "now" every minute
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

  // Load polls and user info
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      try {
        if (!window.ethereum) {
          setError("MetaMask not detected. Please install MetaMask to use this application.");
          setLoading(false);
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);

        // Initialize contract after signer is available
        try {
          let contract;
          let usedAddress = contractAddress;

          try {
            // First try with the imported contract address
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            // Debugging: Log contract object to check if it's correctly initialized
            console.log("Contract object:", contract);

            // Check if contract functions are available
            if (contract.functions) {
              console.log("Contract functions:", Object.keys(contract.functions));
            } else {
              console.error("Contract functions not found!");
            }

            // Check if required functions exist and log their presence
            console.log("getPollMeta exists:", !!contract.getPollMeta);
            console.log("getPollOptions exists:", !!contract.getPollOptions);
            console.log("getTotalPolls exists:", !!contract.getTotalPolls);

            // If any required functions are missing, try the fallback address
            if (!contract.getPollMeta || !contract.getPollOptions || !contract.getTotalPolls) {
              console.warn("Some required contract functions are missing, trying fallback address");

              // Only try fallback if it's different from the primary
              if (contractAddress !== FALLBACK_CONTRACT_ADDRESS) {
                usedAddress = FALLBACK_CONTRACT_ADDRESS;
                contract = new ethers.Contract(FALLBACK_CONTRACT_ADDRESS, contractABI, signer);

                console.log("Fallback contract object:", contract);
                console.log("Fallback contract functions:", Object.keys(contract.functions || {}));
                console.log("Using fallback address:", usedAddress);

                // Check again if the required functions exist
                console.log("Fallback getPollMeta exists:", !!contract.getPollMeta);
                console.log("Fallback getPollOptions exists:", !!contract.getPollOptions);
                console.log("Fallback getTotalPolls exists:", !!contract.getTotalPolls);

                if (!contract.getPollMeta || !contract.getPollOptions || !contract.getTotalPolls) {
                  console.warn("Required functions still missing with fallback address");
                }
              }
            }
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

                // Check if user has voted
                let hasVoted = false;
                try {
                  if (contract.functions && contract.functions.hasVoted) {
                    hasVoted = await contract.functions.hasVoted(i, address);
                  } else {
                    hasVoted = await contract.hasVoted(i, address);
                  }

                  // Convert from potential object format
                  if (typeof hasVoted !== 'boolean') {
                    hasVoted = !!hasVoted[0];
                  }
                } catch (voteErr) {
                  console.error(`Error checking if address has voted on poll ${i}:`, voteErr);
                  // Continue without the hasVoted info
                }

                const start = Number(startTime);
                const end = Number(endTime);
                const active = now >= start && now <= end;

                list.push({
                  id: i,
                  title,
                  start,
                  end,
                  options,
                  votes: votesRaw,
                  active,
                  hasVoted
                });
              } catch (pollErr) {
                console.error(`Error processing poll ${i}:`, pollErr);
                // Continue to the next poll
              }
            }

            setPolls(list);
          } catch (pollsErr) {
            console.error("Error getting polls:", pollsErr);

            // Fallback to using getTotalPolls and getPollOptions
            try {
              console.log("Falling back to getTotalPolls method...");
              let total = 0;

              if (contract.functions && contract.functions.getTotalPolls) {
                total = await contract.functions.getTotalPolls();
              } else {
                total = await contract.getTotalPolls();
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

                  // Check if user has voted
                  let hasVoted = false;
                  try {
                    if (contract.functions && contract.functions.hasVoted) {
                      hasVoted = await contract.functions.hasVoted(i, address);
                    } else {
                      hasVoted = await contract.hasVoted(i, address);
                    }

                    // Convert from potential object format
                    if (typeof hasVoted !== 'boolean') {
                      hasVoted = !!hasVoted[0];
                    }
                  } catch (voteErr) {
                    console.error(`Error checking if address has voted on poll ${i}:`, voteErr);
                  }

                  const start = Number(startTime);
                  const end = Number(endTime);
                  const active = now >= start && now <= end;

                  list.push({
                    id: i,
                    title,
                    start,
                    end,
                    options,
                    votes: votesRaw,
                    active,
                    hasVoted
                  });
                } catch (pollErr) {
                  console.error(`Error loading poll ${i}:`, pollErr);
                }
              }

              // Initialize vote counts from localStorage before setting polls
              const initializedPolls = initializeVoteCountsFromLocalStorage(list);
              setPolls(initializedPolls);
            } catch (fallbackErr) {
              console.error("Error in fallback method:", fallbackErr);
              setError(`Error loading polls: ${fallbackErr.message}`);
            }
          } finally {
            setLoading(false);
          }
        } catch (err) {
          console.error("Error initializing contract:", err);
          setError("Failed to connect to the blockchain. Please check your connection and try again.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error connecting to wallet:", err);
        setError("Failed to connect to your wallet. Please check your connection and try again.");
        setLoading(false);
      }
    })();
  }, [now, refreshCounter]);

  const handleVote = async (pollId, optionIndex, active, hasVoted) => {
    if (!active) {
      alert("❌ Poll not started or already ended.");
      return;
    }
    if (hasVoted) {
      alert("❌ You have already voted in this poll.");
      return;
    }

    setLoading(true);
    setVotingPollId(pollId);
    setVotingOptionIndex(optionIndex);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Debug contract address and ABI
      console.log("Contract Address:", contractAddress);
      console.log("Fallback Contract Address:", FALLBACK_CONTRACT_ADDRESS);
      console.log("Contract ABI:", contractABI);

      let contract;
      let usedAddress = contractAddress;

      try {
        // First try with the imported contract address
        contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Debug contract object
        console.log("Contract Object:", contract);
        console.log("Contract Functions:", Object.keys(contract.functions || {}));

        // Check if the contract has the required function
        console.log("Contract functions:", Object.keys(contract.functions || {}));

        const hasVoteFunction = contract.voteOnPoll ||
                               (contract.functions && contract.functions.voteOnPoll);

        if (!hasVoteFunction) {
          console.warn("voteOnPoll function not found on contract with primary address");

          // Try with fallback address if different from the primary
          if (contractAddress !== FALLBACK_CONTRACT_ADDRESS) {
            console.log("Trying fallback contract address...");
            usedAddress = FALLBACK_CONTRACT_ADDRESS;
            contract = new ethers.Contract(FALLBACK_CONTRACT_ADDRESS, contractABI, signer);

            console.log("Fallback contract object:", contract);
            console.log("Fallback contract functions:", Object.keys(contract.functions || {}));

            const hasFallbackVoteFunction = contract.voteOnPoll ||
                                          (contract.functions && contract.functions.voteOnPoll);

            if (!hasFallbackVoteFunction) {
              throw new Error("voteOnPoll function not found on contract with fallback address");
            }
          } else {
            throw new Error("voteOnPoll function not found on contract");
          }
        }

        // Log contract details
        console.log("Contract address:", usedAddress);
        console.log("Contract functions:", Object.keys(contract.functions || {}));
        console.log("voteOnPoll exists directly:", !!contract.voteOnPoll);
        console.log("voteOnPoll exists in functions:", !!(contract.functions && contract.functions.voteOnPoll));
      } catch (contractErr) {
        console.error("Error initializing contract:", contractErr);
        alert(`❌ Error initializing contract: ${contractErr.message}`);
        setLoading(false);
        return;
      }

      // Before trying to vote, let's do some client-side validation
      console.log(`Validating vote on poll ${pollId}, option ${optionIndex}...`);

      // Check if poll is active
      const now = Math.floor(Date.now() / 1000);
      const poll = polls.find(p => p.id === pollId);

      if (!poll) {
        alert("❌ Poll not found. Please refresh the page and try again.");
        setLoading(false);
        return;
      }

      if (now < poll.start) {
        alert("❌ This poll has not started yet.");
        setLoading(false);
        return;
      }

      if (now > poll.end) {
        alert("❌ This poll has already ended.");
        setLoading(false);
        return;
      }

      if (poll.hasVoted) {
        alert("❌ You have already voted on this poll.");
        setLoading(false);
        return;
      }

      if (optionIndex >= poll.options.length) {
        alert("❌ Invalid option selected.");
        setLoading(false);
        return;
      }

      // Skip simulation and go straight to sending the transaction
      console.log(`Proceeding with vote on poll ${pollId}, option ${optionIndex}...`);

      // 2) now send the transaction
      let tx;
      try {
        console.log(`Sending vote transaction for poll ${pollId}, option ${optionIndex}...`);

        // Set transaction options with higher gas limit
        const options = {
          gasLimit: 300000 // Increase gas limit to handle complex transactions
        };

        // Try all possible ways to call the function
        if (contract.functions && contract.functions.voteOnPoll) {
          console.log("Using contract.functions.voteOnPoll with options");
          tx = await contract.functions.voteOnPoll(pollId, optionIndex, options);
        } else if (contract.voteOnPoll) {
          console.log("Using direct contract.voteOnPoll with options");
          tx = await contract.voteOnPoll(pollId, optionIndex, options);
        } else {
          throw new Error("No method available to send the transaction");
        }

        console.log("Transaction sent:", tx);

        // Show a message that the transaction is being processed
        alert("Transaction submitted! Please wait for confirmation...");

        console.log("Waiting for transaction confirmation...");
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);

        // Check if the transaction was successful
        if (receipt.status === 0) {
          throw new Error("Transaction failed");
        }

        // Update the vote count in localStorage
        try {
          // Get the current poll
          const poll = polls.find(p => p.id === pollId);
          if (poll) {
            // Get current vote counts from localStorage or initialize new array
            let voteCounts = Array(poll.options.length).fill(0);
            try {
              const storedVotes = localStorage.getItem(`poll_votes_${pollId}`);
              if (storedVotes) {
                voteCounts = JSON.parse(storedVotes);
              }
            } catch (storageErr) {
              console.error("Error reading from localStorage:", storageErr);
            }

            // Increment the vote count for the selected option
            voteCounts[optionIndex]++;

            // Save back to localStorage
            localStorage.setItem(`poll_votes_${pollId}`, JSON.stringify(voteCounts));
            console.log(`Updated vote counts in localStorage for poll ${pollId}:`, voteCounts);

            // Update the poll in state
            const updatedPolls = polls.map(p => {
              if (p.id === pollId) {
                return { ...p, votes: voteCounts, hasVoted: true };
              }
              return p;
            });

            // Update state
            setPolls(updatedPolls);
          }
        } catch (updateErr) {
          console.error("Error updating vote counts in localStorage:", updateErr);
        }

        alert("✅ Vote successfully recorded on the blockchain!");
      } catch (txErr) {
        console.error("Error sending transaction:", txErr);

        // Provide more helpful error messages based on common issues
        let errorMessage = "Error sending transaction";

        if (txErr.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected in your wallet";
        } else if (txErr.message.includes("insufficient funds")) {
          errorMessage = "You don't have enough ETH to pay for this transaction";
        } else if (txErr.message.includes("already voted")) {
          errorMessage = "You have already voted on this poll";
        } else if (txErr.message.includes("not active")) {
          errorMessage = "This poll is not currently active";
        } else if (txErr.message.includes("invalid option")) {
          errorMessage = "Invalid option selected";
        } else {
          // If we can't determine the specific error, show the raw message
          errorMessage = txErr.message;
        }

        alert(`❌ ${errorMessage}`);
        setLoading(false);
        return;
      }

      // 3) try to record off-chain (but don't fail if backend is not available)
      try {
        const voter = await signer.getAddress();
        await axios.post("http://localhost:5000/api/polls/vote", {
          pollId,
          optionIndex,
          voter,
          votedAt: Math.floor(Date.now() / 1000)
        });
        console.log("Vote recorded in database");
      } catch (backendErr) {
        console.error("Backend error:", backendErr);
        console.log("Could not record vote in database");
      }

      // refresh polls to show updated vote counts
      setRefreshCounter(prev => prev + 1);
    } catch (err) {
      console.error(err);
      const msg = err.reason || err.message || "Voting failed";
      alert(`❌ ${msg}`);
    } finally {
      setLoading(false);
      setVotingPollId(null);
      setVotingOptionIndex(null);
    }
  };

  const refreshPolls = () => {
    setLoading(true);
    setNow(Math.floor(Date.now() / 1000));
    setRefreshCounter(prev => prev + 1);
  };

  // Function to manually refresh vote counts for a specific poll
  const refreshVoteCounts = async (pollId) => {
    try {
      // Get the current poll
      const poll = polls.find(p => p.id === pollId);
      if (!poll) {
        console.error(`Poll ${pollId} not found`);
        return;
      }

      // Get the provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Fetch vote counts
      const voteCounts = await fetchVoteCounts(contract, pollId, poll.options.length);

      // Update the poll with new vote counts
      const updatedPolls = polls.map(p => {
        if (p.id === pollId) {
          return { ...p, votes: voteCounts };
        }
        return p;
      });

      // Update state
      setPolls(updatedPolls);

      console.log(`Updated vote counts for poll ${pollId}:`, voteCounts);
    } catch (err) {
      console.error(`Error refreshing vote counts for poll ${pollId}:`, err);
    }
  };

  // Function to fetch vote counts using localStorage as a fallback

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

  // Filter polls based on search term
  const filteredPolls = polls.filter(poll =>
    poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    poll.options.some(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a0b2e] pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="mt-16 flex flex-col items-center mb-8">
          <h2 className="text-3xl font-bold text-purple-400 mb-2 text-center">Blockchain Voting Dashboard</h2>
          <p className="text-gray-300 mb-6">Cast your vote on active polls or view results</p>

          {/* Search and Refresh Bar */}
          <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search polls..."
                className="w-full p-3 pl-10 bg-[#2d1b4e] text-white border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-3 text-purple-400">🔍</span>
            </div>
            <button
              onClick={refreshPolls}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-3 rounded-lg flex items-center justify-center shadow-md shadow-purple-900/50 transition-all duration-300 min-w-[180px]"
            >
              <span className="mr-2">🔄</span> Refresh Polls
            </button>
          </div>
        </div>

        {/* Poll Statistics */}
        <div className="w-full max-w-4xl mx-auto p-6 rounded-xl shadow-md mb-8 border border-purple-700 bg-[#1a0b2e]/90 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-4 text-purple-400">Poll Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#2d1b4e] p-4 rounded-lg border border-purple-700">
              <p className="text-sm text-purple-300 mb-1">Total Polls</p>
              <p className="text-2xl font-bold text-purple-400">{polls.length}</p>
            </div>
            <div className="bg-[#2d1b4e] p-4 rounded-lg border border-purple-700">
              <p className="text-sm text-purple-300 mb-1">Active Polls</p>
              <p className="text-2xl font-bold text-purple-400">{polls.filter(p => p.active).length}</p>
            </div>
            <div className="bg-[#2d1b4e] p-4 rounded-lg border border-purple-700">
              <p className="text-sm text-purple-300 mb-1">Your Votes</p>
              <p className="text-2xl font-bold text-purple-400">{polls.filter(p => p.hasVoted).length}</p>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col justify-center items-center py-16 bg-[#1a0b2e]/90 rounded-xl shadow-md border border-purple-700 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
            <p className="text-purple-300 text-lg animate-pulse">Loading polls...</p>
          </div>
        ) : error ? (
          <div className="bg-[#1a0b2e]/90 rounded-xl shadow-md overflow-hidden border border-red-500 backdrop-blur-sm">
            <div className="bg-red-500 h-2"></div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-[#2d1b4e] p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-400">Error Loading Polls</h3>
              </div>
              <p className="text-gray-300 mb-4">{error}</p>
              <p className="text-gray-400 mb-4">
                Try refreshing the page or check the console for more details.
              </p>
              <button
                onClick={refreshPolls}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-md shadow-red-900/50"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredPolls.length === 0 && searchTerm ? (
          <div className="bg-[#1a0b2e]/90 rounded-xl shadow-md p-8 text-center border border-purple-700 backdrop-blur-sm">
            <div className="bg-[#2d1b4e] inline-block p-6 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-purple-400 mb-2">No Matching Polls</h3>
            <p className="text-gray-300 mb-6">No polls match your search for "{searchTerm}".</p>
            <button
              onClick={() => setSearchTerm("")}
              className="inline-block bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-3 rounded-lg shadow-md shadow-purple-900/50 transition-all duration-200"
            >
              Clear Search
            </button>
          </div>
        ) : polls.length === 0 ? (
          <div className="bg-[#1a0b2e]/90 rounded-xl shadow-md p-8 text-center border border-purple-700 backdrop-blur-sm">
            <div className="bg-[#2d1b4e] inline-block p-6 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-purple-400 mb-2">No Polls Available</h3>
            <p className="text-gray-300 mb-6">There are currently no polls available for voting.</p>
            <a
              href="/CreateVote"
              className="inline-block bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-3 rounded-lg shadow-md shadow-purple-900/50 transition-all duration-200"
            >
              Create a New Poll
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPolls.map(p => {
              // Calculate total votes for this poll
              const totalVotes = p.votes.reduce((sum, count) => sum + count, 0);

              return (
                <div key={p.id} className="bg-[#1a0b2e]/90 rounded-xl shadow-md overflow-hidden border border-purple-700 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/30 hover:border-purple-500">
                  {/* Poll header */}
                  <div className="bg-[#2d1b4e] px-4 py-3 text-white">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-purple-400 truncate">{p.title}</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            refreshVoteCounts(p.id);
                          }}
                          className="text-xs text-purple-400 hover:text-purple-300 bg-[#3d2b5e] hover:bg-[#4d3b6e] rounded-lg px-2 py-1 transition-colors duration-200"
                          title="Refresh vote counts"
                        >
                          <span>🔄</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Manually increment vote counts for testing
                            const poll = polls.find(poll => poll.id === p.id);
                            if (poll) {
                              const newVotes = [...poll.votes];
                              // Increment the first option's vote count
                              if (newVotes.length > 0) {
                                newVotes[0]++;
                                localStorage.setItem(`poll_votes_${p.id}`, JSON.stringify(newVotes));

                                // Update the polls state
                                const updatedPolls = polls.map(poll => {
                                  if (poll.id === p.id) {
                                    return { ...poll, votes: newVotes };
                                  }
                                  return poll;
                                });

                                setPolls(updatedPolls);
                              }
                            }
                          }}
                          className="text-xs text-purple-400 hover:text-purple-300 bg-[#3d2b5e] hover:bg-[#4d3b6e] rounded-lg px-2 py-1 transition-colors duration-200"
                          title="Add test vote"
                        >
                          <span>🧪</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-purple-300 text-xs mt-1">
                      🕒 {new Date(p.start * 1000).toLocaleDateString()} — {new Date(p.end * 1000).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Poll status */}
                  <div className="px-4 py-2 bg-[#2d1b4e]/50 border-b border-purple-900/50">
                    <div className="flex flex-wrap gap-1">
                      {p.active ? (
                        <span className="bg-green-900/30 text-green-400 text-xs font-medium px-2 py-0.5 rounded-full border border-green-800/30">
                          Active
                        </span>
                      ) : now < p.start ? (
                        <span className="bg-yellow-900/30 text-yellow-400 text-xs font-medium px-2 py-0.5 rounded-full border border-yellow-800/30">
                          Upcoming
                        </span>
                      ) : (
                        <span className="bg-red-900/30 text-red-400 text-xs font-medium px-2 py-0.5 rounded-full border border-red-800/30">
                          Ended
                        </span>
                      )}

                      {p.hasVoted && (
                        <span className="bg-blue-900/30 text-blue-400 text-xs font-medium px-2 py-0.5 rounded-full border border-blue-800/30">
                          Voted
                        </span>
                      )}

                      <span className="bg-purple-900/30 text-purple-400 text-xs font-medium px-2 py-0.5 rounded-full border border-purple-800/30">
                        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Poll options */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {p.options.map((opt, idx) => {
                        // Calculate percentage for progress bar
                        const percentage = totalVotes > 0 ? Math.round((p.votes[idx] / totalVotes) * 100) : 0;

                        return (
                          <div key={idx} className="relative">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-300 text-sm truncate mr-2">{opt}</span>
                              <span className="text-purple-400 text-xs whitespace-nowrap">{percentage}%</span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-[#2d1b4e] rounded-full h-3 mb-2">
                              <div
                                className="h-3 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#9333ea] transition-all duration-500 ease-out"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Vote buttons */}
                    {p.active && !p.hasVoted && (
                      <div className="mt-3 space-y-2">
                        {p.options.map((opt, idx) => (
                          <button
                            key={idx}
                            className={`w-full ${
                              votingPollId === p.id && votingOptionIndex === idx
                                ? "bg-purple-700 hover:bg-purple-800"
                                : "bg-[#7c3aed] hover:bg-[#6d28d9]"
                            } text-white px-4 py-2 rounded-lg shadow-md shadow-purple-900/50 disabled:opacity-50 transition-all duration-300 text-sm font-medium`}
                            disabled={!p.active || p.hasVoted || loading}
                            onClick={() => handleVote(p.id, idx, p.active, p.hasVoted)}
                          >
                            {votingPollId === p.id && votingOptionIndex === idx ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Voting...
                              </span>
                            ) : (
                              `Vote for "${opt}"`
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Already voted message */}
                    {p.hasVoted && (
                      <div className="mt-3 text-center text-xs text-purple-400">
                        You have already voted on this poll
                      </div>
                    )}

                    {/* Inactive poll message */}
                    {!p.active && !p.hasVoted && (
                      <div className="mt-3 text-center text-xs text-purple-400">
                        {now < p.start ? "This poll has not started yet" : "This poll has ended"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
