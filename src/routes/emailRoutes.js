import { Router } from "express";
import emailController from "../controllers/emailController.js";
import { catchAsync } from "../middlewares/errors.js";

export default () => {
    const api = Router();

    api.post('/email', catchAsync(emailController.sendEmail));

    return api;
}