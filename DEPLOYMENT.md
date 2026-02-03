# 🚀 Production Deployment Checklist

## Pre-Deployment

### 1. Environment Variables
Ensure all required variables are set in your production environment:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-your-production-key
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=warn
```

### 2. Database Migrations
```bash
# Run all pending migrations
cd supabase
supabase db push

# Or use Supabase Studio
# Dashboard > SQL Editor > Run migrations from /supabase/migrations/
```

### 3. Security Checklist
- [ ] All API keys rotated for production
- [ ] Supabase RLS policies enabled
- [ ] Rate limiting configured (100 req/15min default)
- [ ] CORS settings verified
- [ ] Sentry error tracking configured

## Vercel Deployment (Recommended)

### 1. Connect Repository
```bash
# Push to GitHub
git add .
git commit -m "feat: Add AI, Multi-Cloud, Compliance, Testing features"
git push origin main
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables (paste from above)
5. Deploy

### 3. Post-Deployment
- Verify `/api/health` endpoint: `https://yourdomain.com/api/health`
- Test AI features with a sample diagram
- Run compliance scan
- Check Sentry for errors

## Self-Hosted Deployment

### Docker (Coming Soon)
```bash
# Build image
docker build -t jobstack:2.0.0 .

# Run container
docker run -p 3000:3000 --env-file .env.production jobstack:2.0.0
```

### Traditional Server
```bash
# Build
npm run build

# Start
npm start

# Or with PM2
pm2 start npm --name "jobstack" -- start
pm2 save
```

## Monitoring

### Health Check
```bash
curl https://yourdomain.com/api/health
# Expected: {"status":"ok"}
```

### Log Monitoring
```bash
# With PM2
pm2 logs jobstack

# Docker
docker logs -f jobstack

# Vercel
vercel logs --follow
```

### OpenAI Usage
Monitor your OpenAI API usage at:
https://platform.openai.com/usage

Set up billing alerts to avoid unexpected costs.

## Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### AI Features Not Working
1. Check `OPENAI_API_KEY` is set correctly
2. Verify OpenAI account has credits
3. Check Sentry/logs for API errors

### Database Connection Issues
1. Verify Supabase URL and keys
2. Check RLS policies are enabled
3. Test connection: `psql postgres://...`

### Performance Issues
1. Enable Vercel Analytics
2. Check Redis rate limiting
3. Monitor Supabase database performance
4. Consider upgrading OpenAI tier (gpt-4o-mini for lower costs)

## Cost Optimization

### OpenAI API
- Use caching for repeated analyses
- Implement request deduplication
- Consider gpt-4o-mini for cost savings ($0.15 vs $10 per 1M tokens)

### Supabase
- Free tier: 500MB database, 1GB file storage
- Pro tier ($25/mo): 8GB database, 100GB storage
- Monitor with Supabase dashboard

### Vercel
- Free tier: 100GB bandwidth
- Pro tier ($20/mo): 1TB bandwidth
- Enterprise: Custom pricing

## Scaling

### Horizontal Scaling
- Vercel automatically scales serverless functions
- Consider Redis cluster for high traffic
- Use Supabase connection pooling

### Database Optimization
- Add indexes for frequently queried fields
- Enable PostgREST caching
- Consider read replicas for heavy loads

## Backup & Recovery

### Automated Backups
```bash
# Supabase automatic daily backups (enabled by default)
# Retention: 7 days (Free), 30 days (Pro)
```

### Manual Backup
```bash
# Export diagrams
supabase db dump > backup-$(date +%Y%m%d).sql

# Restore
supabase db restore backup-20260203.sql
```

## Support

For deployment issues:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review Vercel/Supabase logs
3. Open GitHub issue with logs
4. Email: support@jobstack.dev

---

**Last Updated:** February 3, 2026
**Version:** 2.0.0
