import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        petNickname: { type: SchemaType.STRING, nullable: true },
        petType: { type: SchemaType.STRING },
        petSchool: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["Fire", "Ice", "Storm", "Life", "Myth", "Death", "Balance"]
        },
        petAge: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["Baby", "Teen", "Adult", "Ancient", "Epic", "Mega", "Ultra"]
        },
        currentStats: {
            type: SchemaType.OBJECT,
            properties: {
                strength: { type: SchemaType.NUMBER },
                intellect: { type: SchemaType.NUMBER },
                agility: { type: SchemaType.NUMBER },
                will: { type: SchemaType.NUMBER },
                power: { type: SchemaType.NUMBER }
            },
            required: ["strength", "intellect", "agility", "will", "power"]
        },
        maxPossibleStats: {
            type: SchemaType.OBJECT,
            properties: {
                strength: { type: SchemaType.NUMBER },
                intellect: { type: SchemaType.NUMBER },
                agility: { type: SchemaType.NUMBER },
                will: { type: SchemaType.NUMBER },
                power: { type: SchemaType.NUMBER }
            },
            required: ["strength", "intellect", "agility", "will", "power"]
        },
        talents: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
        },
        confidence: { type: SchemaType.NUMBER }
    },
    required: ["petType", "petSchool", "petAge", "currentStats", "maxPossibleStats", "confidence"]
};

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash", // Using 2.0 Flash as 2.5 might not be generally available yet or named differently in SDK
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        const prompt = `Analyze this Wizard101 pet stats screenshot:

1. Pet nickname: Look for text with LEFT/RIGHT ARROWS (🔴 buttons) around it.
   Common prefixes: MISTER, KING, QUEEN, BABY, DONA, SIR, LADY, etc.

2. Pet type: Text directly below nickname, NO arrows. Usually has a school icon next to it.

3. School: Circular icon next to pet type:
   - Fire = Flame (red/orange)
   - Ice = Snowflake (blue)
   - Storm = Cloud + lightning (purple)
   - Life = Leaf/spiral (green)
   - Myth = Pyramid with eye (yellow)
   - Death = Skull (black)
   - Balance = Scales (tan/brown)

4. Age: Baby, Teen, Adult, Ancient, Epic, Mega, or Ultra

5. Stats: Extract from formats:
   - "MAX (320)" → current=320, max=320
   - "150/250" → current=150, max=250

6. Talents: All visible talent names in the list

Return JSON matching schema. Confidence 0-100 based on clarity.`;

        // Remove data:image/jpeg;base64, prefix if present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

        const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
        ]);

        const responseText = result.response.text();
        const data = JSON.parse(responseText);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error analyzing pet:", error);
        return NextResponse.json({ error: "Failed to analyze pet" }, { status: 500 });
    }
}
