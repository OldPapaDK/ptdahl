# PTDahl · privat adminarbejdsrum 0.7

GitHub: https://github.com/OldPapaDK/ptdahl · Vercel: https://ptdahl.vercel.app/

## Denne version

- Next.js 16 med Neon Managed Better Auth og login via mail og adgangskode.
- Kontoens mail skal være verificeret, og den skal matche serverens ejeradresse, før der gives adminadgang. Der er ingen regel om, at den første konto bliver administrator.
- Brugeren opretter selv sin adgangskode. Applikationen gemmer den ikke i arbejdsrumsdata. Neon Auth håndterer login.
- Besvarelser, forløb, træningssteder og træningsregistreringer gemmes i et privat arbejdsrum i Neon. Alle læsninger og skrivninger kræver den verificerede ejeridentitet på serveren.
- Databasens ejer-ID kommer altid fra sessionen og kan ikke angives af browseren. Versionstjek afviser overskrivning fra en forældet fane.
- Persondata gemmes ikke i sessionStorage eller localStorage. Netværksfejl vises, og browseren advarer ved lukning med ikke gemte ændringer.
- Generel vidensbank: 164 øvelsesforslag, 42 kilderegistreringer, 52 spørgsmål og 20 principper. Øvelser kræver faglig gennemgang. Egne korte instruktioner og kildehenvisninger; ingen eksterne billeder eller videoer er kopieret.

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

## Dynamisk opvarmning

Migration 006 tilføjer 12 egne opvarmningsforslag med generelle hospitalskilder og markerer fem eksisterende bevægelser som valgbare kandidater. Ingen billeder eller videoer kopieres. Lange statiske hold indgår ikke automatisk i forberedelsen. Bankens opvarmningsfilter og Opret øvelse kan bruges til at udvide kandidaterne.

Nye kladder får konkrete warmup_items med bevægelse og samlet varighed. Skabelonen begynder med rolig march og vælger dynamiske bevægelser med det tilgængelige udstyr med fokus på dagens hovedbevægelser. Den er et forslag til træneren og ikke en individuel egnethedsvurdering. Ved blokerende screeningssvar vælges ingen automatisk opvarmning; træneren skal sammensætte den manuelt og afklare svarene før godkendelse. En ny kladde med en tom opvarmningsliste kan ikke godkendes.

Tilpas opvarmning giver op til seks bevægelser og tider på 0,5 til 15 minutter pr. trin. Tiden inkluderer begge sider og skift. Ændringer kræver en ny programgodkendelse. Opvarmningen tæller med i sessionens samlede tidsbudget; længere opvarmning kan kræve reduktion af hoveddelen. Lettere indkøringssæt og eventuel yderligere pulsstigning aftales individuelt.

Workoutvisning gennemgår hver opvarmningsbevægelse før hoveddelen og kan fortsættes efter pause. PDF/udskriftsvisningen viser også bevægelserne. Der er ingen automatisk timer. Allerede gemte forløb får ikke automatisk ændret opvarmning; træneren kan tilpasse den som ny kladde.

## Invitationer og klientadgang · version 0.8

Migration 007 tilføjer program_access og client_progress. Ejeren opretter et personligt invitationslink fra et gemt, godkendt forløb. Linket gælder i 7 dage, token lagres kun som SHA256, og accept kræver en eksisterende, bekræftet konto med præcis modtagermail. Klienten vælger selv kode i Neon Auth. Der sendes ingen invitationsmail; linket kopieres og sendes manuelt, indtil en mailtjeneste er installeret.

/client viser kun accepterede forløb til den aktuelle konto. En offentlig konto giver ingen programadgang. Deling udgiver et separat snapshot med kun programindhold og relevante øvelsesinstruktioner; spørgeskemasvar, helbredsafklaringer og interne noter deles ikke. En ny kladde ændrer ikke den delte version. Deling igen erstatter snapshot og starter registrering på ny; gamle faner afvises ved versionskonflikt. Klienten kan udskrive alle 12 uger som PDF og gemme fremdrift og faktisk vægt, én opvarmning/øvelse ad gangen.

Invitationer viser afventende, udløbne og aktive adgange. Tilbagekaldelse fjerner adgang og tilhørende registreringer. Klientsletning tilbagekalder alle personens adgange atomisk med fjernelse af arbejdsrumsdata, før eventuel authprofil slettes. Slettede konti og fjernede programmer kan ikke fortsat åbnes via cachede sessions.

Test omfatter offentlig/ikke-ejer afvisning, fremmed origin, revisionskonflikt, snapshotfortrolighed, engangsaccept, udløb, forkert modtager, fremmede program-ID'er, træningsgrænser og ændret programversion. Kontooprettelse og mail-OTP testes ikke ved at oprette rigtige personer automatisk.

## Selvudfyldelse via skemainvitation · version 0.9

Migration 008 opretter intake_requests. Admin opretter et skemalink til navn og mail fra Spørgeskema eller Skemabesvarelser. Token lagres kun hashed, udløber efter 14 dage, og kræver bekræftet modtagermail. Login og mailbekræftelse bevarer invitationsfragmentet. Token sendes til API i header/body, aldrig i URL query eller lokal browserlagring. Automatisk invitationsmail er fortsat ikke konfigureret.

Klienten giver information/samtykke før start, vælger konkret udstyr og kan gemme delvise svar og fortsætte via linket. Svar valideres på serveren mod spørgebanken, valgmuligheder, tidsrammer og udstyr. Skjulte opfølgningssvar fjernes. Mailadressen kan ikke ændres fra den verificerede modtager. Revisioner beskytter mod overskrivning fra gamle faner.

Indsendelse låser skemaet og gemmer svar samt en ny programkladde i ejerens arbejdsrum i samme SQL statement. Kladden er aldrig godkendt eller delt. Kan generatoren ikke sammensætte noget med de oplyste rammer, gemmes besvarelsen med markering til manuel tilpasning. Klienten får kun kvittering, ingen programdata. Deling kræver ejerens eksisterende godkendelse og separate delingshandling.

Admin kan se alle gemte svar under Skemabesvarelser og åbne forløbet med besvarelsen ved siden af i dialogen. Hent nye svar opdaterer arbejdsrummet, når der ikke er lokale ændringer. Besvarelser uden forløb kan åbnes i adminskemaet med en særskilt udstyrsliste. Fjern skemainvitation sletter skemalink og tilhørende svar; allerede importerede forløb bevares. Slet klient omfatter også alle personens skemainvitationer og svar atomisk med øvrige klientdata. Demo opretter ingen invitationer.
