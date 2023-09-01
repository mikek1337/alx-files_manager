import express from 'express';
import router from './routers/index';

const app = express();

app.use('/', router);
app.use(express.json({inflate: true }));
app.listen(process.env.PORT || 4000, () => {
  console.log(`server is running ${process.env.PORT || 4000}`);
});
