import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface ComplianceSummaryRequest {
    commodity: string;
    origin: string;
    destination: string;
    applicableRequirements: Array<{
        requirement: {
            id: number;
            name: string;
            description: string;
        };
        reason: string;
        source: string;
        actions: string[];
    }>;
    nonApplicableRequirements: Array<{
        requirement: {
            id: number;
            name: string;
            description: string;
        };
        reason: string;
    }>;
    pestContext: {
        identifiedPests: Array<{
            pest_id: number;
            name: string;
            acronym: string;
        }>;
        pestsPresent: Array<{
            pest_id: number;
            name: string;
            acronym: string;
        }>;
        pestsAbsent: Array<{
            pest_id: number;
            name: string;
            acronym: string;
        }>;
    };
}

interface OpenRouterResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

// Rate limiting store (in-memory for simplicity)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

function checkRateLimit(clientIP: string): boolean {
    const now = Date.now();
    const key = clientIP;

    const current = rateLimitStore.get(key);

    if (!current || now > current.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
        return false;
    }

    current.count++;
    return true;
}

function validateRequest(data: any): data is ComplianceSummaryRequest {
    return (
        typeof data === 'object' &&
        typeof data.commodity === 'string' &&
        typeof data.origin === 'string' &&
        typeof data.destination === 'string' &&
        Array.isArray(data.applicableRequirements) &&
        Array.isArray(data.nonApplicableRequirements) &&
        typeof data.pestContext === 'object' &&
        Array.isArray(data.pestContext.identifiedPests) &&
        Array.isArray(data.pestContext.pestsPresent) &&
        Array.isArray(data.pestContext.pestsAbsent)
    );
}

function sanitizeInput(data: ComplianceSummaryRequest): ComplianceSummaryRequest {
    // Remove any potentially harmful content and limit string lengths
    const sanitizeString = (str: string, maxLength = 500): string => {
        return str.replace(/[<>]/g, '').substring(0, maxLength);
    };

    return {
        commodity: sanitizeString(data.commodity, 100),
        origin: sanitizeString(data.origin, 50),
        destination: sanitizeString(data.destination, 50),
        applicableRequirements: data.applicableRequirements.slice(0, 20).map(req => ({
            requirement: {
                id: req.requirement.id,
                name: sanitizeString(req.requirement.name, 200),
                description: sanitizeString(req.requirement.description, 1000)
            },
            reason: sanitizeString(req.reason, 500),
            source: sanitizeString(req.source, 200),
            actions: req.actions.slice(0, 10).map(action => sanitizeString(action, 300))
        })),
        nonApplicableRequirements: data.nonApplicableRequirements.slice(0, 20).map(req => ({
            requirement: {
                id: req.requirement.id,
                name: sanitizeString(req.requirement.name, 200),
                description: sanitizeString(req.requirement.description, 1000)
            },
            reason: sanitizeString(req.reason, 500)
        })),
        pestContext: {
            identifiedPests: data.pestContext.identifiedPests.slice(0, 50).map(pest => ({
                pest_id: pest.pest_id,
                name: sanitizeString(pest.name, 100),
                acronym: sanitizeString(pest.acronym, 20)
            })),
            pestsPresent: data.pestContext.pestsPresent.slice(0, 50).map(pest => ({
                pest_id: pest.pest_id,
                name: sanitizeString(pest.name, 100),
                acronym: sanitizeString(pest.acronym, 20)
            })),
            pestsAbsent: data.pestContext.pestsAbsent.slice(0, 50).map(pest => ({
                pest_id: pest.pest_id,
                name: sanitizeString(pest.name, 100),
                acronym: sanitizeString(pest.acronym, 20)
            }))
        }
    };
}

function createPrompt(data: ComplianceSummaryRequest): string {
    const applicableCount = data.applicableRequirements.length;
    const pestsPresent = data.pestContext.pestsPresent.length;
    const pestsAbsent = data.pestContext.pestsAbsent.length;

    // Check if this involves fruit fly host commodities
    const fruitFlyPests = data.pestContext.identifiedPests.filter(pest =>
        pest.name.toLowerCase().includes('fruit fly') ||
        pest.acronym === 'QFF' ||
        pest.acronym === 'MFF'
    );
    const isFruitFlyHost = fruitFlyPests.length > 0;

    // Build detailed requirements list for context
    const requirementsList = data.applicableRequirements.map(req =>
        `- ${req.requirement.name}: ${req.reason}`
    ).join('\n');

    return `You are the Tasmania biosecurity assistant. Your role is to take the list of Import Requirements (IRs) and produce a plain English summary for the user.

**Commodity**: ${data.commodity}
**Origin**: ${data.origin}
**Destination**: ${data.destination}

**Applicable Requirements (${applicableCount})**:
${requirementsList || 'None'}

**Pest Context**:
- ${pestsPresent} pests present in origin state
- ${pestsAbsent} pests absent in origin state
${isFruitFlyHost ? '- This commodity is a fruit fly host' : ''}

**Instructions for Summary**:

1. **Plain English Summary**: Explain requirements in simple, clear terms using friendly language.

2. **Fruit Fly Commodities** ${isFruitFlyHost ? '(APPLIES TO THIS COMMODITY)' : '(Not applicable)'}:
   ${isFruitFlyHost ? `
   - IRs 1–8A, 41, 42, 44, and 45 are equivalent options – only ONE is needed
   - Use language like "You can meet this by doing one of the following..."
   - All fruit fly host produce must comply with Schedule 1B secure handling conditions
   - Warn that treatments may not work on already infested fruit` : ''}

3. **Always Include**:
   - Notice of Intention (NoI) requirement: "You must lodge a Notice of Intention to Import with Biosecurity Tasmania before shipping"
   - Contact details: Email noi.biosecurity@nre.tas.gov.au, Phone (03) 6165 3777
   - General requirements: free from soil, weeds, contaminants; clean packaging
   - If certificates needed: "Contact your local state biosecurity department for inspections"

4. **Structure**:
   - Step 1: State if commodity is restricted/unrestricted
   - Step 2: Summarize applicable IRs (group alternatives)
   - Step 3: List mandatory steps (NoI, certificates, secure handling)
   - Step 4: Provide contact details
   - Step 5: Add disclaimer: "This summary is for guidance only. Please confirm all conditions directly with Biosecurity Tasmania before shipping."

Create a comprehensive but user-friendly summary following this structure.`;
}

let requestCounter = 0;

Deno.serve(async (req: Request) => {
    requestCounter++;
    const requestId = requestCounter;
    console.log(`[Request ${requestId}] Starting request processing`);

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            {
                status: 405,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    }

    try {
        // Get client IP for rate limiting
        const clientIP = req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            'unknown';

        // Check rate limit
        if (!checkRateLimit(clientIP)) {
            return new Response(
                JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Retry-After': '60',
                    },
                }
            );
        }

        // Debug: Log request details
        console.log(`[Request ${requestId}] Method:`, req.method);
        console.log(`[Request ${requestId}] Headers:`, Object.fromEntries(req.headers.entries()));
        console.log(`[Request ${requestId}] URL:`, req.url);

        // Parse and validate request body
        let requestData;
        let bodyText = '';

        try {
            // Read the body as text first to see what we're dealing with
            bodyText = await req.text();
            console.log(`[Request ${requestId}] Raw body length:`, bodyText.length);
            console.log(`[Request ${requestId}] Raw body preview:`, bodyText.substring(0, 300));
            console.log(`[Request ${requestId}] Content-Type header:`, req.headers.get('content-type'));

            if (!bodyText || bodyText.trim() === '') {
                console.error(`[Request ${requestId}] Request body is empty`);
                return new Response(
                    JSON.stringify({ error: 'Request body cannot be empty' }),
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                    }
                );
            }

            // Try to parse the body as JSON
            try {
                requestData = JSON.parse(bodyText);
                console.log(`[Request ${requestId}] Successfully parsed JSON`);
                console.log(`[Request ${requestId}] Parsed data type:`, typeof requestData);
                console.log(`[Request ${requestId}] Parsed data keys:`, Object.keys(requestData || {}));
            } catch (jsonError) {
                console.error(`[Request ${requestId}] JSON parsing failed:`, jsonError.message);
                console.error(`[Request ${requestId}] Failed to parse body:`, bodyText.substring(0, 500));
                return new Response(
                    JSON.stringify({ error: 'Invalid JSON in request body' }),
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                    }
                );
            }

            // Check if we got any data
            if (!requestData || typeof requestData !== 'object') {
                console.error(`[Request ${requestId}] Invalid request data type:`, typeof requestData);
                return new Response(
                    JSON.stringify({ error: 'Request body must be a valid JSON object' }),
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                    }
                );
            }

            console.log(`[Request ${requestId}] Final request data keys:`, Object.keys(requestData));
        } catch (parseError) {
            console.error(`[Request ${requestId}] Unexpected parsing error:`, parseError);
            console.error(`[Request ${requestId}] Body that caused error:`, bodyText.substring(0, 500));
            return new Response(
                JSON.stringify({ error: 'Failed to parse request body' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }

        // Check if the request data is wrapped (Supabase client sometimes wraps the body)
        if (requestData && typeof requestData === 'object' && !requestData.commodity) {
            // Look for the actual data in common wrapper properties
            const possibleData = requestData.body || requestData.data || requestData.payload;
            if (possibleData && typeof possibleData === 'object') {
                console.log(`[Request ${requestId}] Found wrapped data, unwrapping`);
                requestData = possibleData;
            }
        }

        if (!validateRequest(requestData)) {
            console.error(`[Request ${requestId}] Validation failed for request data:`, {
                hasCommodity: !!requestData?.commodity,
                hasOrigin: !!requestData?.origin,
                hasDestination: !!requestData?.destination,
                hasApplicableRequirements: Array.isArray(requestData?.applicableRequirements),
                hasNonApplicableRequirements: Array.isArray(requestData?.nonApplicableRequirements),
                hasPestContext: !!requestData?.pestContext,
                keys: requestData ? Object.keys(requestData) : 'no data'
            });
            return new Response(
                JSON.stringify({ error: 'Invalid request format' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }

        // Sanitize input data
        const sanitizedData = sanitizeInput(requestData);

        // Get OpenRouter API key from environment
        const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
        if (!openRouterApiKey || openRouterApiKey.trim() === '') {
            console.error('OPENROUTER_API_KEY environment variable not set or empty');
            return new Response(
                JSON.stringify({ error: 'Service configuration error' }),
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }

        console.log('OpenRouter API key found, length:', openRouterApiKey.length);

        // Create prompt for LLM
        const prompt = createPrompt(sanitizedData);

        // Create request payload for OpenRouter
        const openRouterPayload = {
            model: 'anthropic/claude-3.5-haiku',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 200,
            temperature: 0.3,
        };

        console.log('Making request to OpenRouter API...');

        // Make request to OpenRouter API
        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openRouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://your-app-domain.com', // Replace with actual domain
                'X-Title': 'Plant Compliance Checker',
            },
            body: JSON.stringify(openRouterPayload),
        });

        if (!openRouterResponse.ok) {
            let errorText = 'Unknown error';
            try {
                errorText = await openRouterResponse.text();
            } catch (textError) {
                console.error('Failed to read error response:', textError);
            }
            console.error('OpenRouter API error:', openRouterResponse.status, errorText);
            return new Response(
                JSON.stringify({ error: 'Failed to generate summary' }),
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }

        let openRouterData: OpenRouterResponse;
        try {
            openRouterData = await openRouterResponse.json();
        } catch (jsonError) {
            console.error('Failed to parse OpenRouter response as JSON:', jsonError);
            const responseText = await openRouterResponse.text();
            console.error('OpenRouter response text:', responseText);
            return new Response(
                JSON.stringify({ error: 'Invalid response from AI service' }),
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }

        if (!openRouterData.choices || openRouterData.choices.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No summary generated' }),
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }

        const summary = openRouterData.choices[0].message.content.trim();

        return new Response(
            JSON.stringify({ summary }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );

    } catch (error) {
        console.error('Edge Function error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    }
});
