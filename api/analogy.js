import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { itemA, itemB } = req.body;
    if (!itemA || !itemB) {
        return res.status(400).json({ error: 'Both items are required' });
    }

    const prompt = `Create a creative, insightful analogy explaining how "${itemA}" is like "${itemB}".

Begin your response with exactly: "${cap(itemA)} is like ${itemB}" — then complete the analogy in 2–3 sentences.

Be surprising and illuminate a truth that connects both things in an unexpected way. Speak directly; no preamble.`;

    try {
        const msg = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 280,
            messages: [{ role: 'user', content: prompt }]
        });
        res.json({ text: msg.content[0].text });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
