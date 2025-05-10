// blockchain.js
require('dotenv').config();
const { ethers } = require('ethers');
const abi = require('./ABIAddress.json'); // make sure your ABI is saved as abi.json

// Connect to Ethereum network (or whatever chain you're using)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Create a wallet instance
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Connect to the smart contract
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

module.exports = contract;
