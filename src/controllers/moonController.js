import {
  getLunarAge,
  getJulianDate,
  getDistance,
  getIllumination,
  getMoonPhases,
  getCalcDate,
  getCalcPhase,
} from "./moon-algorithms/moonPhase.js";

let definePhase = (moonAge) => {
  let idPhase;
  let behaviour = "";
  let phase = "";

  if (moonAge < 0.7549) {
    phase = "New";
    behaviour = "Increases";
    idPhase = 1;
  } 
  else if (moonAge < 6.6994) {
    phase = "Waxing Crescent";
    behaviour = "Increases";
    idPhase = 2;
  } 
  else if (moonAge < 6.9761) {
    phase = "First Quarter";
    behaviour = "Increases";
    idPhase = 3;
  } 
  else if (moonAge < 13.49) {
    phase = "Waxing Gibbous";
    behaviour = "Increases";
    idPhase = 4;
  } 
  else if (moonAge < 15.468) {
    phase = "Full";
    behaviour = "Reduces";
    idPhase = 5;
  } 
  else if (moonAge < 22.4295) {
    phase = "Wanning Gibbous";
    behaviour = "Reduces";
    idPhase = 6;
  } 
  else if (moonAge < 22.81844) {
    phase = "Last Quarter";
    behaviour = "Reduces";
    idPhase = 7;
  } 
  else if (moonAge < 28.6794) {
    phase = "Wanning Crescent";
    behaviour = "Reduces";
    idPhase = 8;
  } 
  else {
    phase = "New";
    behaviour = "Increases";
    idPhase = 1;
  }

  return { phase, behaviour, idPhase }
}

let getPhaseparams = (date) => {
    const DATE = getCalcDate(date);
    const CALCPHASE = getCalcPhase(date);
    const AGE = getLunarAge(date);
    const ILLUMINATION = getIllumination(date) * 100; // *100 because %
    const DISTANCE = getDistance(date);
    const PHASES_NEXT_DATES = getMoonPhases(date);
    const PHASE_INFO = definePhase(AGE);

    return { DATE, CALCPHASE, AGE, ILLUMINATION, DISTANCE, PHASES_NEXT_DATES, PHASE_INFO}
}

export default {
  async calcUserWeight(req, res, next) {
    const { userWeight } = req.query;

    if (!userWeight) {
      return res.status(400).send({
        err: "Missing userWeight data!",
      });
    }

    const resultMoon = userWeight * 1.625;
    const resultEarth = userWeight * 9.807;

    // Unit of result is [N] (1 Newton)
    return res.status(200).send({
      earth: resultEarth,
      moon: resultMoon,
    });
  },

  async calcJulianDate(req, res, next) {
    if (!req.params.date) {
      const currentDate = new Date();
      
      return res.status(200).send({
        date: currentDate.toLocaleDateString() + " " + currentDate.toLocaleTimeString(),
        julianDate: getJulianDate(),
      });
    } 
    else {
      if (!isNaN(new Date(req.params.date).getDate())) {
        const setDate = new Date(req.params.date);
        const julianDate = getJulianDate(setDate);

        return res.status(200).send({
          date: setDate.toLocaleDateString() + " " + setDate.toLocaleTimeString(),
          julianDate: julianDate,
        });
      } 
      else {
        return res.status(400).send({
          err: "The given param does not include the date!",
        });
      }
    }
  },

  async calcMoonPhase(req, res, next) {
    if (!req.params.date) {
        let currentDate = new Date();
        console.log(currentDate)
        const PHASE = getPhaseparams(currentDate);

        return await res.status(200).send({
            date: PHASE.DATE,
            age: PHASE.AGE,
            actualPhase: PHASE.PHASE_INFO.phase,
            behaviour: PHASE.PHASE_INFO.behaviour,
            calcPhase: PHASE.CALCPHASE,
            illumination: PHASE.ILLUMINATION,
            distance: PHASE.DISTANCE,
            nextPhases: PHASE.PHASES_NEXT_DATES
          });
    }
    else {
        if (!isNaN(new Date(req.params.date).getDate())) {
          const setDate = new Date(req.params.date);
          const PHASE = getPhaseparams(setDate);
  
          return res.status(200).send({
            date: PHASE.DATE,
            age: PHASE.AGE,
            actualPhase: PHASE.PHASE_INFO.phase,
            behaviour: PHASE.PHASE_INFO.behaviour,
            calcPhase: PHASE.CALCPHASE,
            illumination: PHASE.ILLUMINATION,
            distance: PHASE.DISTANCE,
            nextPhases: PHASE.PHASES_NEXT_DATES
          });
        } 
        else {
          return res.status(400).send({
            err: "The given param does not include the date!",
          });
        }
      }
  }
};