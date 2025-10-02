require('dotenv').config();

// Analyze finances with OpenAI
exports.analyze = async (req, res) => {
    try {
        const { systemPrompt, userQuery } = req.body;
        
        const apiKey = process.env.OPENAI_API_KEY;
        const apiUrl = "https://api.openai.com/v1/chat/completions";
        
        const payload = {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userQuery }
            ],
            temperature: 0.7,
            max_tokens: 1000
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const result = await response.json();
        const analysisText = result.choices?.[0]?.message?.content;

        if (!analysisText) {
            return res.status(500).json({ error: 'Resposta vazia da API' });
        }

        res.json({ analysis: analysisText });
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        res.status(500).json({ error: 'Erro ao analisar finanças', message: error.message });
    }
};
