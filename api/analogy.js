import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const EFFORT_CONFIGS = {
    quick: {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 80,
        instruction: `One sentence only — a shower thought. Begin with exactly: "${'{cap(itemA)}'} is like ${'{itemB}'}". Punchy, surprising, done.`,
    },
    balanced: {
        model: 'claude-sonnet-4-6',
        max_tokens: 280,
        instruction: `Begin with exactly: "${'{cap(itemA)}'} is like ${'{itemB}'}". Complete the analogy in 2–3 sentences. Be surprising and illuminate a truth that connects both things in an unexpected way. Speak directly; no preamble.`,
    },
    deep: {
        model: 'claude-opus-4-7',
        max_tokens: 800,
        instruction: `Begin with exactly: "${'{cap(itemA)}'} is like ${'{itemB}'}". Then write a full executive summary — multiple paragraphs, structured thinking, real depth. Explore the analogy from multiple angles: structural similarities, surprising implications, where the analogy breaks down, and what it ultimately reveals. This should feel like a proper essay, not a quip.`,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { itemA, itemB, effort = 'balanced' } = req.body;
    if (!itemA || !itemB) {
        return res.status(400).json({ error: 'Both items are required' });
    }

    const config = EFFORT_CONFIGS[effort] ?? EFFORT_CONFIGS.balanced;
    const instruction = config.instruction
        .replace('{cap(itemA)}', cap(itemA))
        .replace('{itemB}', itemB)
        .replace('{cap(itemA)}', cap(itemA))
        .replace('{itemB}', itemB);

    const prompt = `Create a creative, insightful analogy explaining how "${itemA}" is like "${itemB}".

${instruction}`;

    try {
        const msg = await client.messages.create({
            model: config.model,
            max_tokens: config.max_tokens,
            messages: [{ role: 'user', content: prompt }]
        });
        res.json({ text: msg.content[0].text });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
