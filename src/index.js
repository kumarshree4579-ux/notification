require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();
app.use(express.json());

app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/auth', require('./routes/auth.routes'));

connectDB().then(() => {
  app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  );
  require('./bot/bot');
  console.log('Telegram bot started');
});
