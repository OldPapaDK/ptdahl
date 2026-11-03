# PTDahl · privat adminarbejdsrum 0.3

GitHub: https://github.com/OldPapaDK/ptdahl · Vercel: https://ptdahl.vercel.app/

## Denne version

- Next.js 16 med Neon Managed Better Auth og login via mail og adgangskode.
- Kontoens mail skal være verificeret, og den skal matche serverens ejeradresse, før der gives adminadgang. Der er ingen regel om, at den første konto bliver administrator.
- Brugeren opretter selv sin adgangskode. Applikationen gemmer den ikke i arbejdsrumsdata. Neon Auth håndterer login.
- Besvarelser, forløb, træningssteder og træningsregistreringer gemmes i et privat arbejdsrum i Neon. Alle læsninger og skrivninger kræver den verificerede ejeridentitet på serveren.
- Databasens ejer-ID kommer altid fra sessionen og kan ikke angives af browseren. Versionstjek afviser overskrivning fra en forældet fane.
- Persondata gemmes ikke i sessionStorage eller localStorage. Netværksfejl vises, og browseren advarer ved lukning med ikke gemte ændringer.
- Generel vidensbank: 107 øvelsesforslag, 19 kilderegistreringer, 52 spørgsmål og 20 principper. Øvelser kræver faglig gennemgang. Egne korte instruktioner og kildehenvisninger; ingen eksterne billeder eller videoer er kopieret.

Programbyggeren er stadig en første version med forenklede skabeloner og manuel gennemgang. Der er ingen automatisk fast vægtstigning. Mailinvitation, spørgeskema via personligt link og klientadgang til ét godkendt forløb er endnu ikke bygget. Brugervisningen er indtil da adminens forhåndsvisning. PDF bruger browserens udskriftsfunktion; servergenereret PDF og tekniske illustrationer mangler.

## Opret ejerkontoen

Åbn hjemmesiden og vælg Opret konto. Brug den ejeradresse, som er konfigureret på serveren. Vælg selv en adgangskode med mindst 12 tegn. Log ind, vælg Send bekræftelseskode og indtast koden fra mailen fra Neon Auth. Log ind igen efter bekræftelsen.

Før rigtige klientoplysninger registreres, skal den dataansvarlige have fastlagt og oplyst behandlingsgrundlag, samtykke hvor relevant, slettefrist og databehandlerforhold. Helbredsoplysninger skal begrænses til det nødvendige. Der er ingen AI eller ekstern behandling af private besvarelser i denne version.

## Drift og konfiguration

Servervariabler: DATABASE_URL, NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET, PTDAHL_OWNER_EMAIL og PTDAHL_APP_ORIGIN. Ingen hemmelige værdier må lægges i Git eller klientkode. Ejeradressen er en serverindstilling. Auth-cookiehemmeligheden skal være mindst 32 tegn. Auths trusted origin er produktionsdomænet. Loginmail bruger i denne første opsætning Neons fælles mailtjeneste. Egen SMTP skal konfigureres før produktionsbrug med klienter.

Kør `npm ci`, `npm test` og `npm run build` med Node.js 24. Bygningen laver en lokal browserbundle fra den installerede Neon SDK før Next.js bygges. Den genererede bundle og .next er ignoreret i Git.

## Struktur

- `app/api/auth/[...path]`: SDK'ens serverproxy. Ingen selvimplementeret password eller cookiehåndtering.
- `app/api/session`: den aktuelle identitet, uden private arbejdsrumsdata.
- `app/api/workspace`: adgangskontrolleret læsning og skrivning af ejerens arbejdsrum.
- `app/api/knowledge`: skrivebeskyttet offentlig læsning af den generelle vidensbank. Denne route må aldrig udvides med klientoplysninger.
- `lib/policy.js`: ejerkontrol, origin-kontrol og validering af arbejdsrumsformat.
- `public/app.js`: adminflade, spørgeskema, programgennemgang og forhåndsvisning af brugerprogrammet.
- `public/auth-ui.js`: login, kontooprettelse, mailbekræftelse og gendannelse af adgangskode.
- `public/engine.js`: udstyrsmatch, alternative kandidater og forenklede programkladder.
- `public/data`: generelle indholdsfiler; ingen klientoplysninger.
- `db/001_research_seed.sql`: første generelle import.
- `db/002_private_workspace.sql`: privat arbejdsrumsstruktur.
- `db/003_add_reference_exercises.sql`: 26 nye øvelsesforslag og fem kilder, med kildetilføjelser til fire eksisterende poster.

Migrationer skal først køres og kontrolleres på en separat Neon testgren og derefter på main. Der må ikke køres manuelle ændringer i neon_auth schemaet. Kilder og øvelsesdata versionsstyres i Git.

## Kontrol og begrænsninger

Test dækker ejerkontrol med verificeret mail, afvisning af anden konto, afvisning af fremmede origins, ugyldige arbejdsrumsdata, udstyrsmatch, tidsbudgetter, godkendelsesblokering, målrettet mobilitetsskabelon og manglende databaseforbindelse.

Tidsbudgetsberegninger er estimater. Alle indholdsposter er forslag til gennemgang og ikke en klinisk vurdering eller automatisk egnethedsgodkendelse. Adgangskontrollen er implementeret; ejerens første kontooprettelse og mailbekræftelse kan først fuldt kontrolleres, når ejeren selv udfører dem. Passwordgendannelse er implementeret men ikke gennemført med ejerens konto under opbygningen.
