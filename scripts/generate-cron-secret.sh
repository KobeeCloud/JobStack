#!/bin/bash

# Generate a secure CRON_SECRET for GitHub Actions
# Usage: ./scripts/generate-cron-secret.sh

SECRET=$(openssl rand -base64 32)

echo "🔐 Generated CRON_SECRET:"
echo ""
echo "$SECRET"
echo ""
echo "📝 Add this to:"
echo "1. GitHub: Settings → Secrets → Actions → New secret"
echo "   Name: CRON_SECRET"
echo "   Value: (paste the secret above)"
echo ""
echo "2. Vercel: Settings → Environment Variables"
echo "   Name: CRON_SECRET"
echo "   Value: (paste the secret above)"
echo ""
echo "3. Also add to Vercel:"
echo "   VERCEL_DEPLOYMENT_URL=https://jobstack-page.vercel.app"
