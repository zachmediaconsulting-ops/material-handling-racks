# Launch checklist: Cloudflare Pages + Resend

The site is plain files in `dist/` plus one Cloudflare function (`functions/api/quote.js`) that emails the
contact/quote form through Resend. Phone buttons need no setup: they dial 1-989-600-9030 on the live domain.

## 1. Cloudflare Pages project
1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → choose `material-handling-racks`.
2. Production branch: the branch holding the finished site (`main` once created).
3. Build settings: Framework preset **None**, Build command `npm run build`, Build output directory `dist`.
4. **Settings → Variables and Secrets** (Production):
   | Name | Type | Value |
   | --- | --- | --- |
   | `NODE_VERSION` | Text | `22` |
   | `QUOTE_TO` | Text | inbox that receives quotes |
   | `QUOTE_BCC` | Text | hidden copy (optional) |
   | `QUOTE_FROM` | Text | `Rivers Quotes <quotes@materialhandlingracks.com>` |
   | `RESEND_API_KEY` | **Secret** | from Resend → API Keys |
   | `TURNSTILE_SITE_KEY` | Text | optional, from Cloudflare Turnstile |
   | `TURNSTILE_SECRET_KEY` | **Secret** | optional, from Cloudflare Turnstile |
5. **Settings → Runtime → Compatibility flags**: add `nodejs_compat` (faster attachment handling; the form also works without it).
6. Redeploy after changing variables. Test everything on the `*.pages.dev` address first.

## 2. Domain (registered at SiteGround)
1. Cloudflare → **Add a domain** → `materialhandlingracks.com` → Free plan. Cloudflare copies the current DNS records.
2. **Check the copied records before switching**, especially email (MX, TXT/SPF, DKIM) if the domain has email.
3. SiteGround → Domains → `materialhandlingracks.com` → Nameservers → replace with the two Cloudflare nameservers.
4. When Cloudflare shows the domain as active: Pages project → **Custom domains** → add `materialhandlingracks.com` and `www.materialhandlingracks.com`.
5. Cloudflare → Rules → **Redirect Rules** → template "Redirect from WWW to root".

## 3. Resend (quote emails)
1. Resend → **Domains** → add `materialhandlingracks.com` → add the DNS records it lists in Cloudflare DNS.
2. When verified, create an API key and save it as the `RESEND_API_KEY` secret (step 1.4).
3. Send a real test quote with a drawing attached from the live site and confirm it arrives (check spam once).

## 4. After launch
- Google Search Console: add the domain, submit `https://materialhandlingracks.com/sitemap.xml`.
- Keep the old WordPress hosting for a couple of weeks as a backup, then cancel it.

## Form limits
Up to 10 files and 15 MB total per request (keeps the email under common 25 MB inbox limits).
Cloudflare's free plan limits processing time per request; if very large uploads ever fail, the paid Workers plan raises that limit.
