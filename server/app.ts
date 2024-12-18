import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { parseUserQuery } from './controllers/userQueryController.js';
import {
  queryOpenAIArgument,
  queryOpenAIEvaluation,
} from './controllers/openaiController.js';
import {
  logDataAfterDebate,
  logDataDuringDebate,
} from './controllers/loggingController.js';
import {
  customizePrompts,
  parseArguments,
  parseTopic,
  parseDebateHistoryFeedback,
  customizeEvaluationPrompts,
} from './controllers/promptController.js';

import { ServerError } from '../types/types.js';
const app = express();

app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:8080'], // Allow both ports
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

app.post(
  '/api/ai/argument',
  parseUserQuery,
  parseArguments,
  parseTopic,
  customizePrompts,
  queryOpenAIArgument,
  // logDataDuringDebate,
  (_req, res) => {
    res.status(200).json({
      ai_argument: res.locals.aiArgument,
      ai_reasoning: res.locals.aiReasoning,
      ai_strong_point: res.locals.aiStrongPoint,
      ai_weak_point: res.locals.aiWeakPoint,
      user_strong_point: res.locals.userStrongPoint,
      user_weak_point: res.locals.userWeakPoint,
    });
  }
);

app.post(
  '/api/ai/assessment',
  parseUserQuery,
  parseTopic,
  parseDebateHistoryFeedback,
  customizeEvaluationPrompts,
  queryOpenAIEvaluation,
  logDataAfterDebate,
  (_req, res) => {
    //dummy data for front end
    // console.log('did we get to the end of hte post request at assessment');
    // res.locals.compAssessment = 'dummy';
    // res.locals.winner = 'ai';
    // res.locals.userScore = 60;
    // res.locals.aiScore = 40;
    // res.locals.aiAdvice = 'ai gives sage advice';
    // res.locals.userBlindSpots = 'userblindspot';

    // res.status(200).json({
    //   comp_assessment: res.locals.evaluationResult.comp_assessment,
    //   winner: res.locals.winner,
    //   user_score: res.locals.userScore,
    //   ai_score: res.locals.aiScore,
    //   ai_advice: res.locals.aiAdvice,
    //   user_blindspots: res.locals.userBlindspots,
    // });

    res.status(200).json(res.locals.evaluationResult);
  }
);

const errorHandler: ErrorRequestHandler = (
  err: ServerError,
  _req,
  res,
  _next
) => {
  const defaultErr: ServerError = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj: ServerError = { ...defaultErr, ...err };
  console.log(errorObj.log);
  res.status(errorObj.status).json(errorObj.message);
};

app.use(errorHandler);

export default app;
