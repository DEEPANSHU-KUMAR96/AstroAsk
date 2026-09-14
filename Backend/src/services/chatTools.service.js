import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Kundli from "../models/kundli.model.js";
import Horoscope from "../models/horoscope.model.js";
import { getOrGenerateHoroscope } from "./horoscope.service.js";

// Tool 1 — fetch user's kundli from DB
export const getUserKundliTool = (userId) =>
    tool(
        async ({ name }) => {
            const query = name ? { userId, name: { $regex: name, $options: "i" } } : { userId };
            const kundli = await Kundli.findOne(query).sort({ createdAt: -1 }).lean();

            if (!kundli) return "No kundli found for this user.";

            const planets = kundli.planets
                .map((p) => `${p.name} in ${p.sign} House ${p.house}${p.isRetro ? " (Retro)" : ""}`)
                .join(", ");

            return `
Name: ${kundli.name}
Born: ${new Date(kundli.birthDate).toDateString()} at ${kundli.birthTime}, ${kundli.birthPlace}
Sun Sign: ${kundli.sunSign} | Moon Sign: ${kundli.moonSign} | Ascendant: ${kundli.ascendant?.sign}
Current Dasha: ${kundli.currentDasha?.planet} (until ${new Date(kundli.currentDasha?.endDate).getFullYear()})
Planets: ${planets}
      `.trim();
        },
        {
            name: "get_user_kundli",
            description: "Fetch the user's Vedic birth chart (kundli). Use this when the user asks about their planets, ascendant, dasha, or anything related to their birth chart.",
            schema: z.object({
                name: z.string().optional().describe("Name on the kundli, if user specified one"),
            }),
        }
    );

// Tool 2 — fetch today's horoscope for a sign
export const getHoroscopeTool = () =>
    tool(
        async ({ sign, period = "daily", lang = "en" }) => {
            const content = await getOrGenerateHoroscope(sign.toLowerCase(), period, lang);
            return `
${sign} ${period} horoscope:
General: ${content.general}
Love: ${content.love}
Career: ${content.career}
Health: ${content.health}
Finance: ${content.finance}
Lucky: Number ${content.lucky?.number}, Color ${content.lucky?.color}, Day ${content.lucky?.day}
      `.trim();
        },
        {
            name: "get_horoscope",
            description: "Get daily, weekly, or monthly horoscope for a zodiac sign. Use this when user asks about horoscope or rashifal.",
            schema: z.object({
                sign: z.string().describe("Zodiac sign e.g. aries, taurus, leo"),
                period: z.enum(["daily", "weekly", "monthly"]).default("daily"),
                lang: z.enum(["en", "hi"]).default("en"),
            }),
        }
    );