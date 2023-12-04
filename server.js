import express from 'express';
import router from './routes/index';

const app = express();

app.use(express.json());
app.use('/', router);
app.listen(process.env.PORT || 5000, () => {
  console.log(`server is running ${process.env.PORT || 5000}`);
});

export default app;
