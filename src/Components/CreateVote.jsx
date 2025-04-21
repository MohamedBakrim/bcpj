import React, { useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "./Contract";

const CreateVote = () => {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => setOptions([...options, ""]);

  const handleCreatePoll = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const unixStart = Math.floor(new Date(startTime).getTime() / 1000);
      const unixEnd = Math.floor(new Date(endTime).getTime() / 1000);

      const tx = await contract.createPoll(title, options, unixStart, unixEnd);
      await tx.wait();
      alert("Poll created successfully!");
    } catch (error) {
      console.error("Error creating poll:", error);
      alert("Something went wrong while creating the poll.");
    }
  };

  return (
    <div className="w-screen h-screen flex bg-black">
        <div className="p-6 border rounded-xl shadow-md   h-1/2 bg-purple-950 border-purple-400">
      <h2 className="text-2xl font-bold mb-4 text-white font-MAIN">Create a New Poll</h2>

      <input
        type="text"
        placeholder="Poll title"
        className="w-full p-2 mb-4 border rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {options.map((opt, i) => (
        <input
          key={i}
          type="text"
          placeholder={`Option ${i + 1}`}
          className="w-full p-2 mb-2 border rounded"
          value={opt}
          onChange={(e) => handleOptionChange(i, e.target.value)}
        />
      ))}

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={addOption}
      >
        ➕ Add Option
      </button>

      <div className="mb-4">
        <label className="block mb-1">Start Time:</label>
        <input
          type="datetime-local"
          className="w-full p-2 border rounded"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">End Time:</label>
        <input
          type="datetime-local"
          className="w-full p-2 border rounded"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      <button
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
        onClick={handleCreatePoll}
      >
        🚀 Create Poll
      </button>
    </div></div>
    
  );
};

export default CreateVote;
