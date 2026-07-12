export const LIVE_TESTER_IDS = [
  'vercel','netlify','cloudflare','github','gitlab','render','neon','clerk','workos',
  'gemini','groq','openrouter','huggingface','mistral','cohere','replicate','together',
  'elevenlabs','deepgram','stability','fireworks','cerebras','sambanova','assemblyai',
  'pinecone','resend','brevo','postmark','slack','discord','telegram','sentry','axiom',
  'linear','notion','airtable','figma','canva','unsplash','pexels','pixabay','giphy',
  'removebg','freesound','mapbox','maptiler','geoapify','here','opencage','locationiq',
  'ipinfo','weatherapi','openweather','tmdb','nasa','coingecko','alphavantage',
  'exchangerate','newsapi','abstractapi','stripe','lemonsqueezy','virustotal','abuseipdb',
  'ipqualityscore','storyblok','datocms','qstash','pipedream','typeform','jotform','formspree',
] as const
export const LIVE_TESTER_SET = new Set<string>(LIVE_TESTER_IDS)
