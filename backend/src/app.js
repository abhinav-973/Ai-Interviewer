import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import multer from 'multer';

const app = express();
const upload = multer();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(upload.none());

//routes
import userRouter from './routes/user.routes.js';


//routes declaration
app.use("/api/v1/users", userRouter);

app.use((err, req, res, next) => {
  void next;

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal server error",
    errors: err.errors || [],
  });
});

export default app;
