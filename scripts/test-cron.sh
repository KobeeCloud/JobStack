#!/bin/bash

# Test CRON endpoint manually
# Run: ./scripts/test-cron.sh

DOMAIN="${1:-https://jobstack-page.vercel.app}"

echo "🧪 Testing CRON endpoint: $DOMAIN/api/scrape"
echo ""

# Test scraper endpoint
echo "📡 Calling /api/scrape..."
response=$(curl -s -w "\n%{http_code}" "$DOMAIN/api/scrape")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

echo "HTTP Status: $http_code"
echo ""

if [ "$http_code" = "200" ]; then
  echo "✅ SUCCESS! Scraper endpoint works!"
  echo ""
  echo "Response:"
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
  echo "❌ FAILED! HTTP $http_code"
  echo ""
  echo "Response:"
  echo "$body"
fi

echo ""
echo "---"
echo ""
echo "📊 Check jobs in Supabase:"
echo "SELECT source, COUNT(*) as total, MAX(created_at) as last_scraped"
echo "FROM public.jobs"
echo "GROUP BY source;"
