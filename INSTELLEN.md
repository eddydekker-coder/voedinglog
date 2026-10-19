# Voedinglog instellen

Drie stappen: de app online zetten, de etiket-lezer aanzetten en de Opdracht voor Apple Gezondheid maken.

## 1. App op GitHub Pages
1. Maak een nieuwe repo, bijvoorbeeld `voedinglog`, en upload `index.html`, `manifest.webmanifest`, `sw.js`, `icon-180.png` en `icon-512.png`.
2. Zet bij Settings → Pages de branch `main` aan.
3. Open de link in Safari op je iPhone → Deel → **Zet op beginscherm**.

## 2. Etiket lezen (Supabase-functie)
1. Gebruik je bestaande Supabase-account (nieuw project of hetzelfde als Quizcentrale).
2. Installeer de Supabase CLI en log in, of plak de code van `supabase/functions/scan-label/index.ts` in het dashboard onder Edge Functions → New function (naam: `scan-label`).
3. Zet twee secrets (Edge Functions → Secrets):
   - `ANTHROPIC_API_KEY`: je key van console.anthropic.com
   - `APP_TOKEN`: een zelfgekozen lang wachtwoord
4. Zet bij de functie **Verify JWT** uit (de beveiliging loopt via `APP_TOKEN`). Met de CLI: `supabase functions deploy scan-label --no-verify-jwt`.
5. In de app → Instellingen: vul de functie-URL (`https://<project>.supabase.co/functions/v1/scan-label`) en hetzelfde token in.

## 3. Opdracht "Voeding naar Gezondheid"
Een webapp mag niet zelf naar Apple Gezondheid schrijven. Deze Opdracht doet dat wel; de app stuurt de waarden erheen.

Open de **Opdrachten**-app → + → naam: `Voeding naar Gezondheid` (of pas de naam aan in de app-instellingen). Bouw:

1. **Haal woordenboek uit** *Opdrachtinvoer* (Get Dictionary from Input).
2. **Herhaal met elk item** in *Woordenboek*.
3. Per voedingsstof een **Log gezondheidsmonster**-actie, met als waarde het veld uit het item:
   - **Voedingsenergie** ← `kcal` (kilocalorieën)
   - **Eiwit** ← `eiwit` (g)
   - **Koolhydraten** ← `koolhydraten` (g)
   - **Totaal vet** ← `vet` (g)
   - **Suiker** ← `suikers` (g)
   - **Vezels** ← `vezels` (g)
   - **Verzadigd vet** ← `verzadigd` (g)
   - **Natrium** ← `natrium_mg` (mg)
4. Stel bij elke actie de **Datum** in op de waarde `datum` uit het item (zodat het op het juiste tijdstip staat).
5. Sluit de herhaling af.

Tijdens de eerste keer vraagt iOS toestemming om te schrijven naar Gezondheid per soort gegevens. Geef die.

Test: log iets in de app en tik op "Stuur … naar Apple Gezondheid". In Gezondheid → Bladeren → Voeding zie je daarna de waarden.

## Goed om te weten
- De logboeken staan op je telefoon. Maak af en toe een back-up (Instellingen → Exporteer).
- Het etiket lezen kost een paar cent per foto. Controleer de waarden altijd even voor je opslaat.
- Een wijziging of verwijdering in de app past Apple Gezondheid niet aan; dat doe je daar zelf.
