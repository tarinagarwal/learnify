import axios from "axios";

const API_URL = "http://localhost:5001/translate";

export async function translateText(text: string, targetLang: string, sourceLang = "en"): Promise<string> {
  if (!text || targetLang === sourceLang) return text;
  try {
    const response = await axios.post(API_URL, {
      text,
      targetLang,
      sourceLang,
    });
    return response.data.translation || text;
  } catch (error) {
    return text;
  }
}
