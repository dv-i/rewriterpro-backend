require("dotenv").config();
import { getResponseToAPrompt } from "./ChatGpt";
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
    req: { body: { prompt: any; promptOptions: any } },
    res: {
      json: (arg0: { response: any }) => void;
      status: (arg0: number) => {
        (): any;
        new (): any;
        json: { (arg0: { error: string }): void; new (): any };
      };
    }
  ) => {
    const { prompt, promptOptions } = req.body;
    try {
      const result = await getResponseToAPrompt({ prompt, promptOptions });
      res.json({ response: result });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
