const { Router } = require("express");
const {
  healthCheck,
  ingestProductController,
  generateCampaignController,
  listProductsController
} = require("./controller.js");

const router = Router();

router.get("/test", healthCheck);
router.post("/ingest", ingestProductController);
router.post("/campaign", generateCampaignController);
router.get("/products", listProductsController);

module.exports = router;
