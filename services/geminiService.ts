import { GoogleGenAI, Type } from "@google/genai";
import { AIMoveResponse } from "../types";

// Initialize the Gemini Client
// Using the specific variable 'clefAPI' as requested by the user.
// The process polyfill in index.html prevents crashes if env is missing.
const ai = new GoogleGenAI({ apiKey: process.env.clefAPI });

export const getGeminiMove = async (fen: string, validMoves: string[]): Promise<AIMoveResponse> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: `You are a chess grandmaster. The current board state in FEN (Forsyth-Edwards Notation) is: "${fen}". 
      
      The valid legal moves in SAN (Standard Algebraic Notation) are: ${validMoves.join(', ')}.
      
      Analyze the position and choose the absolute best move to win or draw if losing. 
      Provide a brief, witty, or strategic commentary  on why you chose this move (max 1 sentence).`,
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
    // Fallback if AI fails
    return {
      bestMove: validMoves[Math.floor(Math.random() * validMoves.length)],
      commentary: "Je suis un peu distrait... essayons ça.",
    };
  }
};