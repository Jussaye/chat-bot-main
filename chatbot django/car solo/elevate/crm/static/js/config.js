// Define available AI models
const AI_MODELS = {
    gemini: {
        name: 'Gemini',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
        key: 'YOUR_GEMINI_API_KEY',
        headers: {
            'Content-Type': 'application/json'
        },
        formatRequest: (text) => ({
            contents: [{
                parts: [{ text: text }]
            }]
        }),
        formatResponse: (data) => data.candidates[0].content.parts[0].text
    },
    deepseek: {
        name: 'DeepSeek v3',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        key: 'YOUR_OPENROUTER_API_KEY',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_OPENROUTER_API_KEY',
            'HTTP-Referer': window.location.href,
            'X-Title': 'AI Chatbot'
        },
        formatRequest: (text) => ({
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: [
                {
                    "role": "user",
                    "content": text
                }
            ]
        }),
        formatResponse: (data) => data.choices[0].message.content
    },
    meta: {
        name: 'Meta Llama 3.3',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        key: 'YOUR_OPENROUTER_API_KEY',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_OPENROUTER_API_KEY'
        },
        formatRequest: (text) => ({
            model: "meta-llama/llama-3.3-70b-instruct:free",
            messages: [
                {"role": "user", "content": text}
            ]
        }),
        formatResponse: (data) => data.choices[0].message.content
    },
    
    allenai: {
        name: 'AllenAI Molmo 7B',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        key: 'YOUR_OPENROUTER_API_KEY',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_OPENROUTER_API_KEY',
            'HTTP-Referer': window.location.href,
            'X-Title': 'AI Chatbot'
        },
        formatRequest: (text, imageUrl) => ({
            model: "allenai/molmo-7b-d:free",
            messages: [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": text
                        },
                        imageUrl ? {
                            "type": "image_url",
                            "image_url": {
                                "url": imageUrl
                            }
                        } : null
                    ].filter(Boolean)
                }
            ]
        }),
        formatResponse: (data) => data.choices[0].message.content
    },
    qwen: {
        name: 'Qwen 2.5 VL',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        key: 'YOUR_OPENROUTER_API_KEY',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_OPENROUTER_API_KEY',
            'HTTP-Referer': window.location.href,
            'X-Title': 'AI Chatbot'
        },
        formatRequest: (text, imageUrl) => ({
            model: "qwen/qwen2.5-vl-3b-instruct:free",
            messages: [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": text
                        },
                        imageUrl ? {
                            "type": "image_url",
                            "image_url": {
                                "url": imageUrl
                            }
                        } : null
                    ].filter(Boolean)
                }
            ]
        }),
        formatResponse: (data) => data.choices[0].message.content
    },
};

// Define logos for each service
const AI_LOGOS = {
    gemini: "/static/images/gemini.png",
    deepseek: "/static/images/deepseek.png",
    meta: "/static/images/meta.png",
    allenai: "/static/images/allenai.png",
    qwen: "/static/images/qwen.png"
};
