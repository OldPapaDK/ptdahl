# PTDahl · databaseforbundet demo 0.2

Første interaktive design og arbejdsgang til Thomas Wahlgren Dahl.

## Status

Vercel projekt: `ptdahl` i brugerens eksisterende team. GitHub repository: https://github.com/OldPapaDK/ptdahl. Neon projekt: `ptdahl-db` i Frankfurt.

SQL importen blev testet på grenen `ptdahl-setup-validation` og derefter importeret i `main`: 81 øvelser, 14 kilder, 52 spørgsmål og 20 regler. Ingen eksisterende logindata blev ændret.

**Dette er en demo med en rigtig vidensdatabase.** Generelle øvelser, kilder og skemafelter hentes fra Neon gennem en skrivebeskyttet serverfunktion. Adminlogin, brugerlogin, mails og AI er endnu ikke implementeret. Der må kun indtastes fiktive oplysninger. Demoens programmer, steder og træningsregistreringer gemmes i sessionStorage i den aktuelle browserfane. Det er ikke en sikker eller godkendt løsning til rigtige klienter. Programgeneratoren er forenklede skabeloner til afprøvning af flowet; den er ikke den færdige personlige træningsmotor.

81 øvelsesforslag; 14 kilderegistreringer (inklusive indsendte referencekort); 52 spørgeskemafelter; 20 principper. Alle øvelser afventer faglig gennemgang. Nye forslag fra Freeletics referencekort er tydeligt mærket som ikke individuelt verificerede. Referencebillederne genudgives ikke. Ikoner er dekorative.

## Afprøv

1. Åbn Overblik og derefter Forløb.
2. Gennemgå Sofies fiktive forløb, ændr en øvelse eller prøv kommandoen “Skift løb til cykel”.
3. Afkryds gennemgang og tryk Godkend demoforløb.
4. Åbn Brugervisning og prøv Start træning.
5. Udskriv / gem PDF bruger browserens udskriftsfunktion. Der er ingen servergenereret PDF download endnu.
6. Under Spørgeskema kan du indsætte et demoeksempel eller gennemgå felterne selv.
7. Under Træningssteder kan du ændre udstyr og se delvise HYROX alternativer.

Kommandoer er deterministiske demoeksempler, ikke AI. Ændringer bliver kladder og kræver fornyet godkendelse. Helbredsmarkeringer kræver eksplicit demoafklaring. Rigtig klinisk screening er ikke implementeret.

## Kode

- `public/index.html`, `style.css`, `app.js`: brugerflade og demoarbejdsgange.
- `api/knowledge.js`: serverfunktion til læsning af den generelle vidensbank. Ingen klient eller helbredsdata må tilføjes til dette endpoint.
- `public/engine.js`: udstyrsmatch, alternative kandidater og forenklede programkladder.
- `public/data/`: generelle kilder, øvelsesforslag, skemafelter og regler. Ingen persondata.
- `db/001_research_seed.sql`: transaktionel import af 167 generelle indholdsposter til et nyt `training_knowledge` schema. Importeret i PTDahl databasen efter kontrol på en separat testgren.
- `tests/engine.test.mjs`: udstyrsmatch, tidsbudgetter, godkendelsesblokering og fravær af automatisk progression.

Kør `npm ci` og `npm test` med Node.js 24. Serverfunktionen bruger @neondatabase/serverless 1.0.2. Kør applikationen med Vercel og en korrekt konfigureret DATABASE_URL. Frontenden har ingen reservekopi ved databasefejl: den viser en fejl frem for at foregive en aktiv forbindelse. `vercel.json` angiver output og sikkerhedsheadere.

## Næste nødvendige etape

1. Kontroller Vercels Git forbindelse til OldPapaDK/ptdahl, så pushes udløser builds.
2. Neon databasen er oprettet og tilknyttet PTDahl gennem Vercel integrationen. DATABASE_URL er en serverhemmelighed og må aldrig ligge i klientkode eller Git.
3. Vidensbanken er importeret og kontrolleret med SQL. Fremtidige indholdsændringer skal versionsstyres og testes før import.
4. Byg og migrer den private produktmodel: konti, klienter, skemaversioner, besvarelser, afklaringer, versionsstyrede forløb, øvelsesordinationer, godkendelser, invitationsrettigheder og træningslogs.
5. Implementer serverkontrolleret adgang, login og mailinvitation med tidsbegrænset engangslink. Alle API'er og PDF adgang skal kontrollere ejer og godkendt version.
6. Implementer den fulde personlige programgenerator og test mål, niveau, begrænsninger, samlet belastning, faktisk udstyr og realistisk tidsforbrug. En efterfølgende øgning må aldrig være en automatisk fast regel.
7. Gennemgå øvelser og begrundelser fagligt, afklar rettigheder og producer korrekte illustrationer. Afklar helbredsdata, behandlingsgrundlag, slettefrister og databehandlerforhold før rigtig brug.

## Verifikation

Enhedstest passerede for demoens regelsæt. Browserflow gennemført: spørgeskema med eksempelsvar → kladde; eksplicit godkendelse → brugervisning; opvarmning → øvelser → gennemført træning.

Den generelle vidensbank er importeret i Neon. API endpointet /api/knowledge er skrivebeskyttet og læser kun de fire training_knowledge tabeller. Besvarelser, forløb og træningslogs er ikke databaseforbundet. Rigtigt login, mails, privat adgang og servergenereret PDF er ikke implementeret eller testet.
