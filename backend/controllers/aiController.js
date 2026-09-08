import Doctor from '../models/Doctor.js';

export const SPECIALITIES = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist'
];

const RULES = [
    {
        speciality: 'Dermatologist',
        words: ['skin', 'rash', 'acne', 'itch', 'itchy', 'pimple', 'eczema', 'psoriasis', 'hair fall', 'dandruff', 'nail', 'mole', 'fungal', 'pigment', 'allergy on skin']
    },
    {
        speciality: 'Pediatricians',
        words: ['child', 'kid', 'baby', 'infant', 'toddler', 'newborn', 'vaccination', 'paediatric', 'pediatric', 'my son', 'my daughter']
    },
    {
        speciality: 'Gynecologist',
        words: ['period', 'periods', 'menstrual', 'pregnancy', 'pregnant', 'pcos', 'ovary', 'uterus', 'vaginal', 'pcod', 'fertility']
    },
    {
        speciality: 'Neurologist',
        words: ['migraine', 'migraines', 'headache', 'seizure', 'seizures', 'numbness', 'tingling', 'vertigo', 'memory loss', 'stroke', 'tremor', 'nerve']
    }
];

const EMERGENCY = [
    'chest pain',
    'heart attack',
    'can\'t breathe',
    'cannot breathe',
    'difficulty breathing',
    'suicidal',
    'suicide',
    'stroke',
    'unconscious',
    'severe bleeding',
    'coughing blood'
];

const normalizeSpeciality = (value) => {
    const found = SPECIALITIES.find((item) => item.toLowerCase() === String(value || '').toLowerCase());
    return found || 'General physician';
};

export const ruleTriage = (text) => {
    const lower = text.toLowerCase();
    const emergency = EMERGENCY.some((phrase) => lower.includes(phrase));
    let best = { speciality: 'General physician', hits: 0 };

    for (const rule of RULES) {
        const hits = rule.words.filter((word) => lower.includes(word)).length;
        if (hits > best.hits) best = { speciality: rule.speciality, hits };
    }

    const speciality = best.hits > 0 ? best.speciality : 'General physician';
    const summary = emergency
        ? 'These symptoms can be urgent. If they are severe or getting worse, go to emergency care. Otherwise a general physician can triage you.'
        : speciality === 'General physician'
            ? 'A general physician is the safest first stop for this description, then they can refer if needed.'
            : `This sounds closest to ${speciality.toLowerCase()} care. A specialist can examine you properly — this is only a booking suggestion.`;

    return {
        speciality,
        summary,
        urgency: emergency ? 'emergency' : best.hits > 1 ? 'soon' : 'routine',
        provider: 'rules'
    };
};

const extractJson = (raw) => {
    const match = String(raw).match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
        return JSON.parse(match[0]);
    } catch {
        return null;
    }
};

const llmTriage = async (text) => {
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!groqKey && !openaiKey) return null;

    const prompt = `You help patients pick a clinic speciality for booking. You are not a doctor and must not diagnose or suggest medicines.
Allowed specialities only: ${SPECIALITIES.join(', ')}.
Return JSON only: {"speciality":"...","summary":"1-2 sentences","urgency":"routine"|"soon"|"emergency"}
Urgency is emergency only for chest pain, trouble breathing, stroke signs, severe bleeding, or suicidal thoughts.
Patient text: ${JSON.stringify(text)}`;

    const call = groqKey
        ? fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${groqKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                temperature: 0.2,
                messages: [
                    { role: 'system', content: 'Return valid JSON only.' },
                    { role: 'user', content: prompt }
                ]
            })
        })
        : fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                temperature: 0.2,
                messages: [
                    { role: 'system', content: 'Return valid JSON only.' },
                    { role: 'user', content: prompt }
                ]
            })
        });

    const response = await call;
    if (!response.ok) return null;
    const data = await response.json();
    const parsed = extractJson(data.choices?.[0]?.message?.content);
    if (!parsed?.speciality) return null;

    return {
        speciality: normalizeSpeciality(parsed.speciality),
        summary: String(parsed.summary || '').slice(0, 320) || ruleTriage(text).summary,
        urgency: ['routine', 'soon', 'emergency'].includes(parsed.urgency) ? parsed.urgency : 'routine',
        provider: groqKey ? 'groq' : 'openai'
    };
};

export const triageSymptoms = async (req, res) => {
    try {
        const symptoms = String(req.body.symptoms || '').trim();
        if (symptoms.length < 8) {
            return res.status(400).json({ message: 'Describe your symptoms in a short sentence.' });
        }
        if (symptoms.length > 400) {
            return res.status(400).json({ message: 'Please keep it under 400 characters.' });
        }

        let result;
        try {
            result = await llmTriage(symptoms);
        } catch {
            result = null;
        }
        if (!result) result = ruleTriage(symptoms);

        const doctors = await Doctor.find({ speciality: result.speciality })
            .sort({ ratingAvg: -1, name: 1 })
            .limit(4);

        return res.json({
            speciality: result.speciality,
            summary: result.summary,
            urgency: result.urgency,
            provider: result.provider,
            doctors,
            disclaimer: 'This is a booking guide, not a diagnosis. Seek emergency care for severe or sudden symptoms.'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Could not suggest a speciality' });
    }
};
