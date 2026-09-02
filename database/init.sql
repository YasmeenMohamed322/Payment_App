-- ==========================================
-- SimplePay Database Schema
-- ==========================================

-- Drop tables if they already exist
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==========================================
-- USERS
-- ==========================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- ==========================================
-- ACCOUNTS
-- ==========================================

CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    balance DECIMAL(10,2) NOT NULL DEFAULT 1000.00,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ==========================================
-- TRANSACTIONS
-- ==========================================

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,

    sender_id INTEGER NOT NULL,

    receiver_id INTEGER NOT NULL,

    amount DECIMAL(10,2) NOT NULL
        CHECK(amount > 0),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sender
        FOREIGN KEY(sender_id)
        REFERENCES users(id),

    CONSTRAINT fk_receiver
        FOREIGN KEY(receiver_id)
        REFERENCES users(id)
);

-- ==========================================
-- SAMPLE USERS
-- ==========================================

INSERT INTO users(name,email,password)
VALUES
('Ahmed','ahmed@test.com','password123'),
('Sara','sara@test.com','password123'),
('Omar','omar@test.com','password123');

-- ==========================================
-- SAMPLE ACCOUNTS
-- ==========================================

INSERT INTO accounts(user_id,balance)
VALUES
(1,5000),
(2,3000),
(3,2000);

-- ==========================================
-- SAMPLE TRANSACTIONS
-- ==========================================

INSERT INTO transactions(sender_id,receiver_id,amount)
VALUES
(1,2,250),
(2,3,100),
(3,1,75);
