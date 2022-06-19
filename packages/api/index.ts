import express, { Application, Request, Response } from 'express';

import InitializeWs from './services/socket.service';
import { NextFunction } from 'express';
import NirvanaResponse from '@nirvana/core/responses/nirvanaResponse';
import cors from 'cors';
import getConversationRoutes from './routes/conversations';
import getSearchRoutes from './routes/search';
import getUserRoutes from './routes/user';
import morgan from 'morgan';

const app = express();

app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

app.use('/api/status', (req: Request, res: Response) => {
  res.json(new NirvanaResponse('wohoo, server is healthy'));
});

app.use('/api/user', getUserRoutes());
app.use('/api/search', getSearchRoutes());
app.use('/api/conversations', getConversationRoutes());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // use logger or sentry

  if (res.statusCode === 200) res.status(500);

  return res.json(new NirvanaResponse(undefined, err, err.message));
});

app.get('/', (req: Request, res: Response) => {
  res.send('hello world.');
});

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () =>
  console.log(`express running on port | ${PORT} in host machine`),
);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});

InitializeWs(io);
