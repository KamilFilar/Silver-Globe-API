import { Router } from "express";
import moonController from "../controllers/moonController.js";
import { catchAsync } from "../middlewares/errors.js";

export default () => {
    const api = Router();

    api.get('/weight', catchAsync(moonController.calcUserWeight));

    api.get('/julian-date', catchAsync(moonController.calcJulianDate));

    api.get('/julian-date/:date', catchAsync(moonController.calcMoonPhase));

    api.get('/phase', catchAsync(moonController.calcMoonPhase));

    api.get('/phase/:date', catchAsync(moonController.calcMoonPhase));

    return api;
}