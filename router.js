import CostockageRoutes from "./routes/CostockageRoutes.js";
import OprotectRoutes from "./routes/OprotectRoutes.js";
import WizCuttRoutes from "./routes/WizCuttRoutes.js";

export default (app) => {
  app.use("/costockage", CostockageRoutes);
  app.use("/oprotect", OprotectRoutes);
  app.use("/wizcut", WizCuttRoutes);
};
