import { Router } from "express";
const traineesleepingTrack = Router();
import * as sleepTrack from "./sleepTrack.controller.js";
import { allowedTo, verifyToken } from "../../../../middlewares/authToken.js";

// POST endpoint for setting a Sleeping Track
traineesleepingTrack.post("/", verifyToken, allowedTo("trainee"), sleepTrack.addSleepData);

traineesleepingTrack.get("/", verifyToken, allowedTo("trainee"), sleepTrack.getLatestSleepData);

// // GET endpoint for fetching today's Sleeping Track
// traineesleepingTrack.get("/", verifyToken, allowedTo("trainee"), sleepTrack.getSleepData);
// GET endpoint for fetching weekly sleep data
traineesleepingTrack.get("/weekly-sleep", verifyToken, allowedTo("trainee"), sleepTrack.getWeeklySleepData);


export default traineesleepingTrack;
