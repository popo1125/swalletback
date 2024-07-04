const express = require('express');
const mongoose = require('mongoose');
const bip39 = require('bip39');
const crypto = require('crypto');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = 3000;

const uri = "mongodb+srv://taraska2828:Taraseva2323!@swallet.bjl9q0i.mongodb.net/?appName=SWallet";

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

client.connect(err => {
    if (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }

    const db = client.db('telegram_wallets');
    const usersCollection = db.collection('users');

    app.use(express.json());

    app.post('/api/create_wallet', async (req, res) => {
        const { user_id, username } = req.body;
        
        const phrase = bip39.generateMnemonic();
        const key = crypto.randomBytes(32).toString('hex');
        const wallet_id = crypto.randomBytes(4).toString('hex');

        const newUser = {
            user_id,
            username,
            phrase,
            key,
            wallet_id,
        };

        try {
            await usersCollection.insertOne(newUser);
            res.status(201).json(newUser);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
});
