// api/ki-assistant.js
// Erstelle diese Datei in deinem /api Verzeichnis

import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
    // CORS Headers für Frontend-Zugriff
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, context, phase, promptKey } = req.body;

        // System-Prompt für triadisches Coaching
        const systemPrompt = `Du bist ein KI-Assistent für triadisches Coaching nach Prof. Geißler.

AKTUELLE SITUATION:
- Coaching-Phase: ${phase || 1}/8
- Kontext: ${context || 'Ruhestandscoaching'}
- Verwendeter Prompt: ${promptKey || 'Allgemein'}

DEINE ROLLE:
- Unterstütze den Coach mit konkreten, sofort anwendbaren Interventionen
- Fokussiere auf Ruhestandscoaching und Lebensübergänge
- Gib 3-4 konkrete Fragen oder Techniken
- Sei präzise, empathisch und lösungsorientiert

COACHING-PHASEN:
1. Begrüßung und Rapport
2. Situationsanalyse
3. Ziele definieren
4. Hindernisse identifizieren
5. Lösungsoptionen
6. Konkrete Schritte
7. Reflexion
8. Abschluss

ANTWORT-FORMAT:
- Kurze Situationseinschätzung
- 3-4 konkrete Fragen/Interventionen
- Methodische Hinweise für den Coach
- Auf emotionale Aspekte achten`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: message
                }
            ],
            max_tokens: 600,
            temperature: 0.7
        });

        const response = completion.choices[0].message.content;

        // Response an Frontend senden
        res.status(200).json({
            success: true,
            response: response,
            usage: completion.usage
        });

    } catch (error) {
        console.error('OpenAI API Error:', error);
        
        // Fallback-Antwort bei API-Fehler
        const fallbackResponse = getFallbackResponse(req.body.message, req.body.phase);
        
        res.status(200).json({
            success: false,
            response: fallbackResponse,
            error: 'OpenAI API temporarily unavailable'
        });
    }
}

// Fallback-Antworten wenn OpenAI nicht verfügbar
function getFallbackResponse(message, phase) {
    const fallbacks = {
        1: `Für die Begrüßungsphase empfehle ich:
        
1. "Wie geht es Ihnen heute mit dem Thema Ruhestand?"
2. "Was beschäftigt Sie am meisten?"
3. "Welche Erwartungen haben Sie an unser Gespräch?"

Schaffen Sie eine vertrauensvolle Atmosphäre.`,
        
        2: `Für die Situationsanalyse nutzen Sie:
        
1. "Beschreiben Sie Ihre aktuelle Situation"
2. "Was läuft gut, was bereitet Sorgen?"
3. "Welche Veränderungen stehen an?"

Hören Sie aktiv zu und fragen Sie nach.`,
        
        default: `Allgemeine Coaching-Unterstützung:
        
1. Stellen Sie offene Fragen
2. Reflektieren Sie das Gehörte
3. Fokussieren Sie auf Ressourcen
4. Entwickeln Sie kleine Schritte

Bleiben Sie empathisch und lösungsorientiert.`
    };
    
    return fallbacks[phase] || fallbacks.default;
}