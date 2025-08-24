# LLM Integration Testing Guide

This document provides guidance on testing the OpenRouter LLM integration for compliance summarization.

## Manual Testing Steps

### 1. Edge Function Testing

First, ensure the Edge Function is deployed and working:

```bash
# Deploy the function
./scripts/deploy-edge-function.sh

# Set the API key
npx supabase secrets set OPENROUTER_API_KEY=your_openrouter_api_key

# Test the function directly
curl -X POST 'https://your-project.supabase.co/functions/v1/compliance-summarization' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
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
        "reason": "Queensland Fruit Fly present in origin state",
        "source": "Biosecurity Act 2015",
        "actions": ["Obtain treatment certificate"]
      }
    ],
    "nonApplicableRequirements": [],
    "pestContext": {
      "identifiedPests": [{"pest_id": 1, "name": "Queensland Fruit Fly", "acronym": "QFF"}],
      "pestsPresent": [{"pest_id": 1, "name": "Queensland Fruit Fly", "acronym": "QFF"}],
      "pestsAbsent": []
    }
  }'
```

Expected response:
```json
{
  "summary": "Your apple shipment from Victoria to Tasmania requires fruit fly treatment due to Queensland Fruit Fly presence in Victoria. You'll need to obtain a treatment certificate before transport."
}
```

### 2. Frontend Integration Testing

Test the LLM integration through the web interface:

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Navigate through the form**:
   - Go to the guided form
   - Enter a commodity (e.g., "Apple")
   - Select origin state (e.g., "Victoria")
   - Complete the pest analysis step
   - Reach the compliance results step

3. **Verify LLM integration**:
   - Look for the blue summary box with sparkles icon
   - Check for "AI-generated summary" text below the summary
   - Verify the summary is contextual and relevant

### 3. Error Handling Testing

Test various error scenarios:

#### 3.1 LLM Service Unavailable
- Temporarily set an invalid API key
- Complete the form flow
- Verify fallback summary appears
- Check for appropriate error message

#### 3.2 Network Timeout
- Use browser dev tools to throttle network
- Complete the form flow
- Verify graceful degradation

#### 3.3 Invalid Response
- Modify the Edge Function to return invalid data
- Test that fallback summary is used

## Expected Behaviors

### Success Case
- ✅ AI summary appears in blue box with sparkles icon
- ✅ "AI-generated summary" label is shown
- ✅ Summary is contextual and relevant
- ✅ No error messages displayed

### Fallback Case
- ✅ Standard summary appears
- ✅ Yellow warning about AI service unavailability
- ✅ Detailed requirements still displayed
- ✅ Form remains functional

### Error Case
- ✅ Fallback summary used
- ✅ Error message explains the issue
- ✅ User can still proceed with form
- ✅ No application crashes

## Performance Expectations

- **Summary Generation**: < 5 seconds
- **Timeout Handling**: 15 seconds maximum
- **Rate Limiting**: 10 requests per minute per IP
- **Graceful Degradation**: Always functional without AI

## Monitoring

Monitor the integration through:

1. **Supabase Dashboard**:
   - Edge Functions logs
   - Function invocation metrics
   - Error rates

2. **Browser Console**:
   - Network requests to Edge Function
   - LLM service error logs
   - Performance timing

3. **User Experience**:
   - Summary quality and relevance
   - Loading states and feedback
   - Error message clarity

## Troubleshooting

### Common Issues

1. **"Service configuration error"**:
   - Check OPENROUTER_API_KEY is set
   - Verify API key is valid

2. **"Rate limit exceeded"**:
   - Wait 60 seconds and retry
   - Check if multiple users are testing

3. **"Request timeout"**:
   - Check network connectivity
   - Verify OpenRouter API status

4. **CORS errors (blocked by CORS policy)**:
   - Ensure Edge Function includes x-client-info and apikey in allowed headers
   - Redeploy Edge Function if CORS headers were updated

5. **"Unexpected end of JSON input" error**:
   - Check if OPENROUTER_API_KEY is properly set in Supabase secrets
   - Verify OpenRouter API is responding correctly
   - Check Edge Function logs for detailed error information
   - Test with minimal payload using test script

6. **Invalid summary content**:
   - Check prompt engineering in Edge Function
   - Verify request data structure

### Debug Steps

1. Check browser network tab for Edge Function calls
2. Review Supabase function logs
3. Verify environment variables are set
4. Test Edge Function directly with curl
5. Check OpenRouter API status and quotas
