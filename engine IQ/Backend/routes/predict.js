const express = require("express");
const router = express.Router();
const { predict, getHistory, deletePrediction } = require("../controllers/predictController");

router.post("/", predict);
router.get("/history/:userId", getHistory);
router.delete("/:id", deletePrediction);

module.exports = router;
