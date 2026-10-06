# jaimecanalejo.me

Personal site of Jaime Canalejo Rodríguez. Plain static HTML/CSS/JS — no build step.

```
index.html        all content (English + Spanish side by side: <span class="en"> / <span class="es">)
styles.css        design tokens at the top (colors, fonts)
main.js           EN/ES toggle, overlay menu, scroll reel, accordion, counters
assets/           favicon.svg, og.png (link preview); drop your photo here as jaime.jpg
404.html, robots.txt, sitemap.xml, vercel.json
```

## Edit
- **Photo:** save a square photo as `assets/jaime.jpg` (otherwise a "JC" tile shows).
- **LinkedIn link:** in `index.html` replace the URL on the element with `id="linkedinLink"` (currently a LinkedIn search) with your profile URL.
- **Email (optional):** add another `<a class="clink" href="mailto:...">` in the Contact section.
- Every text has an English and a Spanish version — update both.

## Run locally
    npx http-server -p 8765 .

## Deploy (Vercel)
    npm i -g vercel
    vercel            # preview
    vercel --prod     # production
Then in Vercel → Project → Domains, add `jaimecanalejo.me` (buy it there or point your registrar's DNS to Vercel).
