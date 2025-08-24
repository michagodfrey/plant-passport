#!/bin/bash

# Deploy Compliance Summarization Edge Function
# This script deploys the Edge Function to Supabase using npx

set -e

echo "🚀 Deploying Compliance Summarization Edge Function..."

# Check if Node.js is available (required for npx)
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

# Check if we're logged in to Supabase
echo "🔍 Checking Supabase authentication..."
if ! npx supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please login first:"
    echo "   npx supabase login"
    exit 1
fi

# Deploy the function
echo "📦 Deploying function..."
npx supabase functions deploy compliance-summarization

echo "✅ Edge Function deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set the OPENROUTER_API_KEY secret:"
echo "   npx supabase secrets set OPENROUTER_API_KEY=your_api_key_here"
echo ""
echo "2. Test the function:"
echo "   curl -X POST 'https://your-project.supabase.co/functions/v1/compliance-summarization' \\"
echo "     -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"commodity\":\"Apple\",\"origin\":\"Victoria\",\"destination\":\"Tasmania\",...}'"
echo ""
echo "3. Update your frontend environment variables if needed"
echo ""
echo "💡 Tip: You can also run Supabase commands directly with:"
echo "   npx supabase --help"
