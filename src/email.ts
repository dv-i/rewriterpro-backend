import axios, { AxiosRequestConfig } from "axios";

interface AccessTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
}

interface SingleVerifierResponse {
  result: boolean;
}

interface VerificationEmailResponse {
  result: boolean;
  id: string;
}

interface FinalVerifierResponse {
  result: boolean;
  data?: {
    email: string;
    checks: {
      status: number;
      valid_format: number;
      disposable: number;
      webmail: number;
      gibberish: number;
      status_text: string;
    };
  };
}

export const sendVerificationEmail = async (
  email: string,
  name: string,
  code: string
) => {
  const token = await getAccessToken();
  if (!token) {
    return null;
  }
  const requestBody = {
    email: {
      from: { email: "support@rewriterpro.ai", name: "RewriterPro.Ai" },
      to: [{ email: email }],
      subject: "RewriterPro.Ai sign up verification code",
      template: {
        id: "e47d52db03e1d746305df5617b0d52b6",
        variables: {
          code: code,
          name: name,
        },
      },
    },
  };

  const sendEmailAPIUrl = `https://api.sendpulse.com/smtp/emails`;
  const requestConfig: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.post<VerificationEmailResponse>(
      sendEmailAPIUrl,
      requestBody,
      requestConfig
    );
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
};

export const verifyEmail = async (email: string): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) {
    return false;
  }

  const verifyResult = await verifyEmailWithToken(email, token);
  if (!verifyResult || !verifyResult.result) {
    return false;
  }
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const singleResult = await getSingleResult(email, token);
  if (!singleResult || !singleResult.result) {
    return false;
  }

  if (singleResult.data?.checks.status === 1) {
    return true;
  }

  return false;
};

const getAccessToken = async (): Promise<string | null> => {
  const tokenUrl = "https://api.sendpulse.com/oauth/access_token";
  const clientId = process.env.SENDPULSE_CLIENT_ID;
  const clientSecret = process.env.SENDPULSE_CLIENT_SECRET;

  try {
    const response = await axios.post<AccessTokenResponse>(tokenUrl, {
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    return null;
  }
};

const verifyEmailWithToken = async (
  email: string,
  token: string
): Promise<SingleVerifierResponse | null> => {
  const verifyUrl = `https://api.sendpulse.com/verifier-service/send-single-to-verify/`;
  const verifyConfig: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.post<SingleVerifierResponse>(
      verifyUrl,
      { email },
      verifyConfig
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying email:", error);
    return null;
  }
};

const getSingleResult = async (
  email: string,
  token: string
): Promise<FinalVerifierResponse | null> => {
  const resultUrl = `https://api.sendpulse.com/verifier-service/get-single-result/?email=${email}`;
  const resultConfig: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get<FinalVerifierResponse>(
      resultUrl,
      resultConfig
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching single result:", error);
    return null;
  }
};
