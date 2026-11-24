# studieschuld-aflossen.nl

Onafhankelijke rekentool: loont het om extra af te lossen op je DUO-studieschuld (SF35), of wordt het restant na 35 jaar toch kwijtgescholden? Met een vergelijking tussen aflossen uit eigen geld en aflossen via het IKB van je werkgever.

Niet verbonden aan DUO. Uitkomsten zijn schattingen, geen financieel advies.

## Bestanden
| Bestand | Wat |
|---|---|
| `index.html` | De website en de rekentool |
| `regels.json` | Getallen die jaarlijks veranderen (vrijstelling, percentages, IKB-standaard) |
| `CLAUDE.md` | Werkinstructies voor de agent die de regels bijhoudt |

## Bijwerken
Wijzigingen gaan via een pull request. Na het mergen naar `main` zet Cloudflare Pages de site automatisch live.

## Advertenties en partnerplekken
Staan uit. Aanzetten: zet in `index.html` `class="ads"` op het `<html>`-element. Dan worden de advertentievakken, het hypotheek-partnerblok en de cookietekst in de voettekst zichtbaar. Doe dit pas als er echte advertenties en een cookiebanner zijn.

## Beveiliging
- `_headers`: beveiligingsheaders voor Cloudflare Pages (altijd https, niet in een frame te laden, alleen scripts en lettertypes van de site zelf). Komen er later advertenties of statistieken bij, dan moet de `Content-Security-Policy` daarvoor worden verruimd.
- Lettertypes staan in `fonts/` (Space Grotesk en Inter, SIL Open Font License) zodat er geen verzoeken naar Google gaan.
- `main` is afgeschermd: wijzigingen alleen via een pull request.
