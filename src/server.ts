require("dotenv").config();
import { getAIDetectionScore, getResponseToAPrompt } from "./ChatGpt";
const cors = require("cors");

const express = require("express");

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// OpenAI routes
app.post(
  "/api/getResponseToAPrompt",
  async (
    req: {
      body: { prompt: any; promptOptions: any; isHumanizeEnabled: boolean };
    },
    res: {
      json: (arg0: { response: any }) => void;
      status: (arg0: number) => {
        (): any;
        new (): any;
        json: { (arg0: { error: string; details: string }): void; new (): any };
      };
    }
  ) => {
    const { prompt, promptOptions, isHumanizeEnabled } = req.body;
    try {
      const result = await getResponseToAPrompt({
        prompt,
        promptOptions,
        isHumanizeEnabled,
      });
      res.json({ response: result });
    } catch (error: any) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  }
);

app.post(
  "/api/getAiDetectionScore",
  async (
    req: {
      body: { text: any };
    },
    res: {
      json: (arg0: { response: any }) => void;
      status: (arg0: number) => {
        (): any;
        new (): any;
        json: { (arg0: { error: string; details: string }): void; new (): any };
      };
    }
  ) => {
    const { text } = req.body;
    try {
      const result = await getAIDetectionScore(text);
      res.json({ response: result });
    } catch (error: any) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
