# PTDahl · privat adminarbejdsrum 0.6

GitHub: https://github.com/OldPapaDK/ptdahl · Vercel: https://ptdahl.vercel.app/

## Denne version

- Next.js 16 med Neon Managed Better Auth og login via mail og adgangskode.
- Kontoens mail skal være verificeret, og den skal matche serverens ejeradresse, før der gives adminadgang. Der er ingen regel om, at den første konto bliver administrator.
- Brugeren opretter selv sin adgangskode. Applikationen gemmer den ikke i arbejdsrumsdata. Neon Auth håndterer login.
- Besvarelser, forløb, træningssteder og træningsregistreringer gemmes i et privat arbejdsrum i Neon. Alle læsninger og skrivninger kræver den verificerede ejeridentitet på serveren.
- Databasens ejer-ID kommer altid fra sessionen og kan ikke angives af browseren. Versionstjek afviser overskrivning fra en forældet fane.
- Persondata gemmes ikke i sessionStorage eller localStorage. Netværksfejl vises, og browseren advarer ved lukning med ikke gemte ændringer.
- Generel vidensbank: 152 øvelsesforslag, 38 kilderegistreringer, 52 spørgsmål og 20 principper. Øvelser kræver faglig gennemgang. Egne korte instruktioner og kildehenvisninger; ingen eksterne billeder eller videoer er kopieret.

Programbyggeren er stadig en første version med forenklede skabeloner og manuel gennemgang. Der er ingen automatisk fast vægtstigning. Mailinvitation, spørgeskema via personligt link og klientadgang til ét godkendt forløb er endnu ikke bygget. Brugervisningen er indtil da adminens forhåndsvisning. PDF bruger browserens udskriftsfunktion; servergenereret PDF og tekniske illustrationer mangler.

## Demo og udbygning af øvelsesbank

`/demo` er tilgængelig fra login og admin. Den starter uden kontooprettelse med tre fiktive personer, særskilte eksempelsteder og et godkendt forløb. Den indlæser kun den generelle vidensbank. Ingen private sessioner, klientlister eller arbejdsrumsdata hentes, og alle demoændringer ligger kun i sidens hukommelse. Genindlæsning nulstiller demoen. Gem, øvelsesoprettelse og sletning i demoen kalder ikke de rigtige mutationsendpoints. PDF kan gemmes lokalt fra en træningsforhåndsvisning. Der sendes ingen invitationer i demoen.

Ejeren kan under Øvelsesbank vælge Opret øvelse eller bruge en eksisterende øvelse som skabelon til en ny variant. Begge dele opretter et nyt ID; eksisterende øvelser og programhenvisninger ændres ikke. Instruktion, kategori, niveau, nødvendigt udstyr, maskinmærke, model, kildelink, faglige noter og gennemgangsstatus kan angives. Bankdata er generel offentlig viden, så klientoplysninger må aldrig skrives her. Billedupload og direkte overskrivning af eksisterende øvelser er endnu ikke tilføjet. Ingen faste kilo eller træningsmængder angives i banken.

`/api/exercises` kræver verificeret ejer ved både læsning og oprettelse; oprettelse kræver også samme origin. Serveren vælger ID, validerer udstyr og https kildelink og fastholder medical_clearance_claim=false. Den offentlige bank kan være op til 60 sekunder forsinket efter en ny øvelse. Admin henter de aktuelle øvelser uden cache ved indlæsning.

Øvelsesbanken har nu filtre for mærke og udstyr samt søgning på serie og model. Maskineksempler er knyttet til generiske bevægelser på tværs af BH Fitness/MOVEMIA, Technogym, Life Fitness og Matrix Fitness. Der er 195 katalogkoblinger fordelt på nye og eksisterende øvelser; flere koblinger kan referere til samme maskine med flere funktioner. Katalogmatch dokumenterer navne og tilsigtede bevægelser, ikke en klinisk godkendelse eller automatisk kompatibilitet for enhver variant. Kilo omregnes ikke mellem modeller. Instruktionerne er egne korte forslag til trænergennemgang; billeder og manualer kopieres ikke.

Ground genvejen er fjernet. Træningssteder oprettes frit med deres konkrete udstyr. Eventuelle allerede gemte private steder slettes ikke af kodeændringen. M170 fra MOVEMIA er ikke tilknyttet en bestemt lårcurlposition, fordi producentens overskrift og siddende beskrivelse er indbyrdes modstridende. Technogym kilderne er hentet hos Technogym Danmark/Pedan; Technogyms globale hjemmeside kunne ikke hentes.

Migration 004 tilføjer en revisionskolonne og generelle kilde- og øvelsesposter. Den skal køres på testgren først, derefter main. ON CONFLICT DO NOTHING bevarer eksisterende bankdata.

## Klientadministration og sletning

Klienter samler forløb efter normaliseret mailadresse og viser loginprofiler uden forløb. Et ufærdigt spørgeskema med mailadresse vises også. Ældre forløb uden mail kan slettes enkeltvis. Ejeren vises som beskyttet og kan ikke slettes via applikationen.

Sletning kræver ejerens verificerede session, samme origin, den aktuelle arbejdsrumsrevision og den eksplicitte bekræftelse SLET. Først fjernes alle matchende forløb, deres besvarelser, træningsregistreringer og en matchende igangværende besvarelse i én databaseopdatering. Revisionen hæves, så gamle faner ikke kan genskabe slettede data. Derefter slettes en eventuel loginprofil via Neon Auths officielle admin.removeUser API. Serveren kontrollerer, at profilen er væk, før den melder fuldført. Hvis loginprofilen ikke kunne slettes, vises delvis gennemførelse, og ejeren kan gentage fra oversigten. Ingen manuelle writes til neon_auth.

Ejerens eksisterende Neon Auth bruger skal have den indbyggede adminrolle for at udføre kontosletning. Appens egne rettigheder kræver stadig den verificerede ejeradresse. Den generelle authproxy afviser rå adminruter, selvbetjent kontosletning og mailskift, så appens slettekontrol ikke omgås gennem proxyen.

Fælles træningssteder bevares. Eksterne PDF eksporter og udbyderens sikkerhedskopier slettes ikke af handlingen. Appen lover derfor ikke, at alle kopier overalt er øjeblikkeligt slettet. Der er endnu ingen klientinvitationer eller klientadgang at tilbagekalde. Disse skal knyttes til samme sletteflow, når de tilføjes.

## Opret ejerkontoen

Åbn hjemmesiden og vælg Opret konto. Brug den ejeradresse, som er konfigureret på serveren. Vælg selv en adgangskode med mindst 12 tegn. Log ind, vælg Send bekræftelseskode og indtast koden fra mailen fra Neon Auth. Log ind igen efter bekræftelsen.

Før rigtige klientoplysninger registreres, skal den dataansvarlige have fastlagt og oplyst behandlingsgrundlag, samtykke hvor relevant, slettefrist og databehandlerforhold. Helbredsoplysninger skal begrænses til det nødvendige. Der er ingen AI eller ekstern behandling af private besvarelser i denne version.

## Drift og konfiguration

Servervariabler: DATABASE_URL, NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET, PTDAHL_OWNER_EMAIL og PTDAHL_APP_ORIGIN. Ingen hemmelige værdier må lægges i Git eller klientkode. Ejeradressen er en serverindstilling. Auth-cookiehemmeligheden skal være mindst 32 tegn. Auths trusted origin er produktionsdomænet. Loginmail bruger i denne første opsætning Neons fælles mailtjeneste. Egen SMTP skal konfigureres før produktionsbrug med klienter.

Kør `npm ci`, `npm test` og `npm run build` med Node.js 24. Bygningen laver en lokal browserbundle fra den installerede Neon SDK før Next.js bygges. Den genererede bundle og .next er ignoreret i Git.

## Struktur

- `app/api/auth/[...path]`: SDK'ens serverproxy. Ingen selvimplementeret password eller cookiehåndtering.
- `app/api/session`: den aktuelle identitet, uden private arbejdsrumsdata.
- `app/api/clients`: ejerbeskyttet klientoversigt og sletning.
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

Migration 005 tilføjer 30 øvelsesforslag og 13 kilder samt producentreferencer på eksisterende poster. Eksisterende instruktioner, noter og ejerens egne øvelser overskrives ikke. Gentagen kørsel dublerer ikke referencer. Testet på separat gren før main. Ingen private arbejdsrumsdata ændres af migrationen.

Ejeren kan fra en øvelses detalje vælge Tilføj mærke og model. Handlingen tilføjer kun producentmetadata på samme ID, kræver ejeradgang, samme origin og revisionskontrol og ændrer ikke instruktioner. Egenregistreringer er markeret særskilt fra katalogmatch. Demo gør samme handling i hukommelsen.
