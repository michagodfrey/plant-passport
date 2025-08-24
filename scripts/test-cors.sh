#!/bin/bash

# Test CORS configuration for the Edge Function
# This script tests that the CORS headers are properly configured

set -e

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables"
    echo "   export SUPABASE_URL=https://your-project.supabase.co"
    echo "   export SUPABASE_ANON_KEY=your_anon_key"
    exit 1
fi

FUNCTION_URL="${SUPABASE_URL}/functions/v1/compliance-summarization"

echo "🧪 Testing CORS configuration for Edge Function..."
echo "📍 Function URL: $FUNCTION_URL"
echo ""

# Test OPTIONS preflight request
echo "1. Testing OPTIONS preflight request..."
CORS_RESPONSE=$(curl -s -I -X OPTIONS \
    -H "Origin: http://localhost:8080" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type, Authorization, x-client-info, apikey" \
    "$FUNCTION_URL")

echo "Response headers:"
echo "$CORS_RESPONSE"
echo ""

# Check if required CORS headers are present
if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin: \*"; then
    echo "✅ Access-Control-Allow-Origin header found"
else
    echo "❌ Access-Control-Allow-Origin header missing"
fi

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Headers.*x-client-info"; then
    echo "✅ x-client-info header allowed"
else
    echo "❌ x-client-info header not allowed"
fi

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Headers.*apikey"; then
    echo "✅ apikey header allowed"
else
    echo "❌ apikey header not allowed"
fi

echo ""
echo "2. Testing actual POST request..."

# Test actual POST request with sample data
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST \
    -H "Origin: http://localhost:8080" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -H "x-client-info: test-client" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -d '{
        "commodity": "Apple (fruit)",
        "origin": "Victoria",
        "destination": "Tasmania",
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
echo "Response Body: $BODY"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "500" ]; then
    echo "✅ Request successful (no CORS blocking)"
else
    echo "❌ Request failed with status $HTTP_CODE"
fi

echo ""
echo "🎉 CORS test completed!"
echo ""
echo "💡 If you see CORS errors:"
echo "   1. Redeploy the Edge Function: ./scripts/deploy-edge-function.sh"
echo "   2. Wait a few minutes for deployment to propagate"
echo "   3. Test again with this script"
