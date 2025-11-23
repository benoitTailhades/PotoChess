import { GoogleGenAI, Type } from "@google/genai";
import { AIMoveResponse } from "../types";

export const getGeminiMove = async (fen: string, validMoves: string[]): Promise<AIMoveResponse> => {
  try {
    // According to coding guidelines, API key must be strictly from process.env.API_KEY
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
        console.warn("API Key 'API_KEY' is missing in process.env");
        throw new Error("API_KEY manquante dans les variables d'environnement.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: `You are a chess grandmaster. The current board state in FEN (Forsyth-Edwards Notation) is: "${fen}". 
      
      The valid legal moves in SAN (Standard Algebraic Notation) are: ${validMoves.join(', ')}.
      
      Analyze the position and choose the absolute best move to win or draw if losing. 
      Provide a brief, witty, or strategic commentary on why you chose this move (max 1 sentence).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bestMove: {
              type: Type.STRING,
              description: "The chosen move in Standard Algebraic Notation (SAN), e.g., 'Nf3', 'e5', 'O-O'. Must be one of the valid moves provided.",
            },
            commentary: {
              type: Type.STRING,
              description: "A short comment explaining the move strategy.",
            },
          },
          required: ["bestMove", "commentary"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AIMoveResponse;

  } catch (error) {
    console.error("Gemini Chess Error:", error);
    // Fallback silencieux si l'IA échoue pour ne pas bloquer le jeu
    return {
      bestMove: validMoves[Math.floor(Math.random() * validMoves.length)],
      commentary: "Je n'arrive pas à me connecter à mon cerveau (Vérifiez la clé API)... je joue au hasard !",
    };
  }
};