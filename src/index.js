require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const { validatePayload } = require('./middleware/validatePayload');

const app = express();
app.use(cors());
app.use(express.json());
app.use(validatePayload);

app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/errors', require('./routes/error.routes'));

connectDB().then(() => {
  app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  );
  try {
    require('./bot/bot');
    console.log('Telegram bot started');
  } catch (e) {
    console.error('Telegram bot failed to start:', e.message);
  }
});
