# Ekko worker (real AI replies)

A small Cloudflare Worker that forwards chat messages from the portfolio to Claude. The Anthropic
API key stays in the Worker's secrets; the website never sees it.

## Deploy
```sh
cd ekko-worker
npm install
npx wrangler login                      # opens the browser to sign in to Cloudflare (free account is fine)
npx wrangler secret put ANTHROPIC_API_KEY   # paste your key when prompted
npx wrangler deploy                     # prints https://ekko-worker.<you>.workers.dev
```
Then put that URL into `assets/js/ekko-config.js`, commit and push. Until it's set, Ekko keeps using
his built-in scripted answers, and he also falls back to them if the Worker is down.

## Protect your wallet
- In the Anthropic Console, set a **monthly spend limit** on the key's workspace.
- Origins are restricted to `ALLOWED_ORIGINS` in `wrangler.toml`; each IP is limited to 12 requests a minute;
  messages are capped at 500 characters and the last 8 turns; replies are capped by `max_tokens`.
- `EKKO_MODEL` in `wrangler.toml` picks the model. It is set to `claude-haiku-5-5`, which is roughly 40 times
  cheaper than `claude-opus-5-5` and plenty for this job. Change it there if you want a more capable model.

## Local test
Create `.dev.vars` with `ANTHROPIC_API_KEY=...`, run `npx wrangler dev`, and set the endpoint in
`ekko-config.js` to `http://localhost:8787`.
