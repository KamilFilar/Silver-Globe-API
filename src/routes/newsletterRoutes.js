import { Router } from "express";
import newsletterController from "../controllers/newsletterController.js";
import { catchAsync } from "../middlewares/errors.js";

export default () => {
    const api = Router();

    api.post('/', catchAsync(newsletterController.addEmail));

    return api;
}