const express = require('express');
const mongoose = require('mongoose');
const bip39 = require('bip39');
const crypto = require('crypto');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config(); // Добавьте эту строку

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI; // Используйте переменную окружения

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

    // Маршрут для создания кошелька
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

    // Маршрут для получения информации о пользователе
    app.get('/api/user/:user_id', async (req, res) => {
        const user_id = parseInt(req.params.user_id);

        try {
            const user = await usersCollection.findOne({ user_id: user_id });
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Маршрут для удаления пользователя
    app.delete('/api/user/:user_id', async (req, res) => {
        const user_id = parseInt(req.params.user_id);

        try {
            const result = await usersCollection.deleteOne({ user_id: user_id });
            if (result.deletedCount === 1) {
                res.status(200).json({ message: 'User deleted successfully' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
});
