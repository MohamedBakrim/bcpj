import React, { useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "./Contract";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CreateVote = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => setOptions([...options, ""]);

  const handleCreatePoll = async () => {
    // Validate inputs
    if (!title.trim()) {
      alert("Please enter a poll title");
      return;
    }

    if (options.some(opt => !opt.trim())) {
      alert("Please fill in all options");
      return;
    }

    if (!startTime || !endTime) {
      alert("Please set both start and end times");
      return;
    }

    setIsCreating(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const unixStart = Math.floor(new Date(startTime).getTime() / 1000);
      const unixEnd = Math.floor(new Date(endTime).getTime() / 1000);

      const tx = await contract.createPoll(title, options, unixStart, unixEnd);
      await tx.wait();

      alert("Poll created successfully!");

      // Navigate to the ShowPolls page
      navigate("/ShowPolls");
    } catch (error) {
      console.error("Error creating poll:", error);
      alert("Something went wrong while creating the poll.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a0b2e]">
      <div className="w-full min-h-screen flex items-center justify-center px-4 py-24 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 border-2 rounded-2xl shadow-2xl bg-[#1a0b2e]/90 border-purple-500 backdrop-blur-sm"
        >
          <h2 className="text-3xl font-bold mb-6 text-purple-400 font-MAIN text-center">Create a New Poll</h2>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Poll title"
                className="w-full p-3 pl-4 bg-[#2d1b4e] text-white border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-3 my-4">
              {options.map((opt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="relative"
                >
                  <input
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    className="w-full p-3 pl-4 bg-[#2d1b4e] text-white border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                  />
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-lg w-full mb-4 shadow-md shadow-purple-900/50 transition-all duration-300 flex items-center justify-center space-x-2"
              onClick={addOption}
            >
              <span>➕</span>
              <span>Add Option</span>
            </motion.button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-purple-300 text-sm font-medium mb-1">Start Time:</label>
                <input
                  type="datetime-local"
                  className="w-full p-3 bg-[#2d1b4e] text-white border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-purple-300 text-sm font-medium mb-1">End Time:</label>
                <input
                  type="datetime-local"
                  className="w-full p-3 bg-[#2d1b4e] text-white border border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: isCreating ? 1 : 1.03 }}
              whileTap={{ scale: isCreating ? 1 : 0.97 }}
              className="mt-6 bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white px-6 py-3 rounded-lg w-full font-medium shadow-lg shadow-purple-900/50 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-70"
              onClick={handleCreatePoll}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  <span>Creating Poll...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Create Poll</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateVote;
