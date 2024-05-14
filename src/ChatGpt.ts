import { PromptOptions } from "./interfaces";

interface GetResponseToAPromptArgs {
  prompt: string;
  promptOptions: PromptOptions;
  isHumanizeEnabled: boolean;
  selectedModel: string;
}
export const HUMANIZE_PROMPT = `Rewrite the given text, and follow these rules: use short and low syllables, change words with simpler words, and use varied sentence lengths. use most common words in the English language when possible. Keep word count the same.`;

export const AI_DETECTOR_API_URL = "https://detector.essaycheck.ai/detect/";

export const getResponseToAPrompt = async ({
  prompt,
  promptOptions,
  isHumanizeEnabled,
  selectedModel,
}: GetResponseToAPromptArgs): Promise<string | undefined> => {
  const apiKey = process.env.REACT_APP_OPEN_AI_API_KEY || "";
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const requestData = {
    model:
      selectedModel === "Swift" ? "gpt-3.5-turbo-0125" : "gpt-4o",
    messages: [
      {
        role: "user",
        content: promptFormatter({
          prompt,
          promptOptions,
          isHumanizeEnabled,
          selectedModel,
        }),
      },
    ],
    temperature: 1,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    return data.choices[0].message.content as string;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Error fetching data");
  }
};

const promptFormatter = ({
  prompt,
  promptOptions,
  isHumanizeEnabled,
}: GetResponseToAPromptArgs): string => {
  let formattedPrompt = prompt;
  formattedPrompt += isHumanizeEnabled
    ? HUMANIZE_PROMPT
    : "Please rewrite the above text for me";
  if (promptOptions) {
    const { fluency, audience, tone, emotion, length, language } =
      promptOptions;
    formattedPrompt += fluency ? ` with ${fluency.toLowerCase()} fluency,` : "";
    formattedPrompt += tone ? ` in a ${tone.toLowerCase()} tone,` : "";
    formattedPrompt += audience
      ? ` for a ${audience.toLowerCase()} audience,`
      : "";
    formattedPrompt += emotion
      ? ` with ${emotion.toLowerCase()} emotions,`
      : "";
    formattedPrompt += length ? ` and ${length.toLowerCase()} in length,` : "";
    formattedPrompt += language
      ? ` and also translate to ${language.toLowerCase()} and only return the translated text without the original text and without quotes\n`
      : "";
  }

  return formattedPrompt;
};

export const getAIDetectionScore = async (
  text: string
): Promise<string | undefined> => {
  const apiKey = process.env.REACT_APP_AI_DETECTOR_SECRET || "";

  const headers = {
    "Content-Type": "application/json",
  };

  const requestData = {
    content: text,
    user_secret: apiKey,
  };

  try {
    const response = await fetch(AI_DETECTOR_API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    if (data.length === 0) {
      return;
    }
    return `${Math.round(data[0]["AI"] * 100)}`;
  } catch (error: any) {
    throw new Error(error);
  }
};
