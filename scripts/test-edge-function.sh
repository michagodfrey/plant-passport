#!/bin/bash

# Test the Edge Function with a minimal payload
# This script helps debug Edge Function issues

set -e

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables"
    echo "   export SUPABASE_URL=https://your-project.supabase.co"
    echo "   export SUPABASE_ANON_KEY=your_anon_key"
    exit 1
fi

FUNCTION_URL="${SUPABASE_URL}/functions/v1/compliance-summarization"

echo "🧪 Testing Edge Function with minimal payload..."
echo "📍 Function URL: $FUNCTION_URL"
echo ""

# Test with minimal valid payload
echo "Testing with minimal payload..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -d '{
        "commodity": "Test Commodity",
        "origin": "Test Origin",
        "destination": "Test Destination",
        "applicableRequirements": [],
        "nonApplicableRequirements": [],
        "pestContext": {
            "identifiedPests": [],
            "pestsPresent": [],
            "pestsAbsent": []
        }
    }' \
    "$FUNCTION_URL")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "HTTP Status Code: $HTTP_CODE"
echo "Response Body:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# Analyze the response
case $HTTP_CODE in
    200)
        echo "✅ Function executed successfully!"
        if echo "$BODY" | grep -q '"summary"'; then
            echo "✅ Summary field found in response"
        else
            echo "❌ Summary field missing from response"
        fi
        ;;
    400)
        echo "❌ Bad Request - Check request format"
        ;;
    429)
        echo "⚠️  Rate limit exceeded - Wait and try again"
        ;;
    500)
        echo "❌ Internal Server Error - Check function logs"
        if echo "$BODY" | grep -q "Service configuration error"; then
            echo "💡 Hint: Check if OPENROUTER_API_KEY is set in Supabase secrets"
        fi
        ;;
    *)
        echo "❌ Unexpected status code: $HTTP_CODE"
        ;;
esac

echo ""
echo "💡 To check function logs:"
echo "   npx supabase functions logs compliance-summarization"
echo ""
echo "💡 To set OpenRouter API key:"
echo "   npx supabase secrets set OPENROUTER_API_KEY=your_key_here"
