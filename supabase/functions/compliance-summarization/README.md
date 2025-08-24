# Compliance Summarization Edge Function

This Supabase Edge Function provides AI-powered summarization of plant compliance requirements using the OpenRouter API.

## Features

- **Secure API Proxy**: Safely proxies requests to OpenRouter API without exposing API keys to the frontend
- **Request Validation**: Validates and sanitizes all incoming requests
- **Rate Limiting**: Implements per-IP rate limiting (10 requests per minute)
- **Error Handling**: Comprehensive error handling with graceful fallbacks
- **CORS Support**: Properly configured CORS for frontend access (includes x-client-info and apikey headers)

## Environment Variables

The following environment variable must be set in your Supabase project:

- `OPENROUTER_API_KEY`: Your OpenRouter API key for accessing LLM services

## API Endpoint

### POST `/functions/v1/compliance-summarization`

Generates an AI summary of compliance requirements.

#### Request Body

```json
{
  "commodity": "Apple (fruit)",
  "origin": "Victoria",
  "destination": "Tasmania",
  "applicableRequirements": [
    {
      "requirement": {
        "id": 1,
        "name": "Fruit Fly Treatment",
        "description": "All fruit must be treated for fruit fly"
      },
      "reason": "Fruit fly present in origin state",
      "source": "Biosecurity Act 2015",
      "actions": ["Obtain treatment certificate"]
    }
  ],
  "nonApplicableRequirements": [],
  "pestContext": {
    "identifiedPests": [
      {
        "pest_id": 1,
        "name": "Queensland Fruit Fly",
        "acronym": "QFF"
      }
    ],
    "pestsPresent": [
      {
        "pest_id": 1,
        "name": "Queensland Fruit Fly",
        "acronym": "QFF"
      }
    ],
    "pestsAbsent": []
  }
}
```

#### Response

```json
{
  "summary": "Your apple shipment from Victoria to Tasmania requires fruit fly treatment due to Queensland Fruit Fly presence in Victoria. You'll need to obtain a treatment certificate before transport."
}
```

#### Error Responses

- `400 Bad Request`: Invalid request format
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Service configuration or processing error

## Rate Limiting

- **Limit**: 10 requests per minute per IP address
- **Window**: 60 seconds (rolling window)
- **Response**: HTTP 429 with `Retry-After` header

## Security Features

### Input Sanitization

- Removes potentially harmful HTML characters (`<`, `>`)
- Limits string lengths to prevent abuse
- Limits array sizes to prevent resource exhaustion

### Request Validation

- Validates request structure and required fields
- Ensures all required properties are present and correctly typed
- Rejects malformed requests with clear error messages

### API Key Protection

- API key stored securely in Supabase environment variables
- Never exposed to frontend or logs
- Requests proxied through secure Edge Function

## Deployment

1. **Set Environment Variable**:
   ```bash
   npx supabase secrets set OPENROUTER_API_KEY=your_api_key_here
   ```

2. **Deploy Function**:
   ```bash
   npx supabase functions deploy compliance-summarization
   ```

3. **Test Function**:
   ```bash
   curl -X POST 'https://your-project.supabase.co/functions/v1/compliance-summarization' \
     -H 'Authorization: Bearer YOUR_ANON_KEY' \
     -H 'Content-Type: application/json' \
     -d '{"commodity":"Apple","origin":"Victoria","destination":"Tasmania",...}'
   ```

## Error Handling

The function implements comprehensive error handling:

- **Network Errors**: Graceful handling of OpenRouter API failures
- **Validation Errors**: Clear error messages for invalid requests
- **Rate Limiting**: Proper HTTP status codes and retry guidance
- **Service Errors**: Fallback responses when AI service is unavailable

## Monitoring

Monitor function performance and errors through:

- Supabase Dashboard > Edge Functions
- Function logs for debugging
- Rate limiting metrics
- Error rate monitoring

## Development

For local development:

1. **Start Supabase locally**:
   ```bash
   npx supabase start
   ```

2. **Set local environment variable**:
   ```bash
   echo "OPENROUTER_API_KEY=your_key" > supabase/.env.local
   ```

3. **Serve functions locally**:
   ```bash
   npx supabase functions serve compliance-summarization
   ```

4. **Test locally**:
   ```bash
   curl -X POST 'http://127.0.0.1:54321/functions/v1/compliance-summarization' \
     -H 'Content-Type: application/json' \
     -d '{"commodity":"test",...}'
   ```
