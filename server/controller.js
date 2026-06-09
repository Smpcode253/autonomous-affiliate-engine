import axios from "axios";
import pool from "./db.js";

export const test = (req, res) => {
  res.json({ status: "backend online" });
};

export const ingest = async (req, res) => {
  try {
    const { url } = req.body;

    const result = await axios.get(url);

    res.json({
      success: true,
      message: "Product ingested",
      data: result.data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const campaign = async (req, res) => {
  try {
    const { product, platform } = req.body;

    res.json({
      success: true,
      message: "Campaign generated",
      campaign: {
        product,
        platform,
        copy: `Promote ${product} on ${platform} with this CTA...`
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};