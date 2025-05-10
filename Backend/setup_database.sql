-- Database setup script for the VoteX application
-- Run this script to create the necessary database and tables

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS pollsdb;

-- Use the database
USE pollsdb;

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  startTime BIGINT NOT NULL,
  endTime BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create options table
CREATE TABLE IF NOT EXISTS options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poll_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poll_id INT NOT NULL,
  option_index INT NOT NULL,
  voter VARCHAR(42) NOT NULL, -- Ethereum address
  voted_at BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

-- Add some sample data (optional)
INSERT INTO polls (title, startTime, endTime) VALUES 
('Sample Poll 1', UNIX_TIMESTAMP(), UNIX_TIMESTAMP() + 86400),
('Sample Poll 2', UNIX_TIMESTAMP(), UNIX_TIMESTAMP() + 172800);

-- Add options for sample poll 1
INSERT INTO options (poll_id, name) VALUES 
(1, 'Option 1'),
(1, 'Option 2'),
(1, 'Option 3');

-- Add options for sample poll 2
INSERT INTO options (poll_id, name) VALUES 
(2, 'Yes'),
(2, 'No'),
(2, 'Maybe');

-- Instructions for setting up the database:
-- 1. Install MySQL if not already installed
-- 2. Run this script using the MySQL command line client:
--    mysql -u root -p < setup_database.sql
-- 3. Make sure the .env file has the correct database credentials
