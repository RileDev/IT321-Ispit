# Vodič kroz Teoriju Testiranja: React i Playwright

Ovaj dokument je namenjen studentima koji uče testiranje softvera. Kroz praktične primere iz aplikacije **ApexParts**, ovde su objašnjeni ključni koncepti jediničnog/integracionog testiranja korisničkog interfejsa (React) i testiranja prihvatljivosti (E2E pomoću Playwright-a).

---

## 1. Testiranje React Komponenti (Component Testing)

Testiranje React komponenti se nalazi na **srednjem nivou softverske piramide testiranja**. Ono kombinuje elemente jediničnog testiranja (izolacija komponente) i integracionog testiranja (saradnja više pod-komponenti i stanja unutar virtuelnog DOM-a).

```
   ▲
  / \      E2E Testiranje (Playwright) - Realan browser, realna baza
 /   \     
/     \    Testiranje Komponenti (Vitest + RTL + MSW) - JSDOM, mrežni mock
-------    
/     \    Jedinično Testiranje (JUnit + Mockito) - Izolovana biznis logika
\_____/
```

### 1.1 Alati u našem steku
1. **Vitest**: Pokretač testova (Test Runner). On učitava test datoteke, izvršava ih, obezbeđuje funkcije za grupisanje testova (`describe`, `test`) i proveru očekivanja (`expect`).
2. **React Testing Library (RTL)**: Biblioteka koja omogućava montiranje (rendering) React komponenti u virtuelno okruženje i interakciju sa njima.
3. **JSDOM**: Virtuelna implementacija W3C DOM standarda u Node.js-u. Omogućava izvršavanje React koda na računaru bez otvaranja pravog pretraživača, čineći testove izuzetno brzim.

---

### 1.2 Ključni Koncept: Testiranje Ponašanja vs. Testiranje Implementacije
Jedno od najvažnijih pravila modernog UI testiranja je:
> **"Testirajte ponašanje koje korisnik vidi, a ne unutrašnju implementaciju komponente."**

- **Loša praksa (White-Box / Implementaciono testiranje)**: Testiranje stanja komponente (npr. provera da li je `state.loading` postavljen na `true` ili da li je pozvana interna metoda `handleClick`). Ako promenite naziv varijable stanja ili refaktorišete kod bez promene izgleda, testovi će pasti, iako aplikacija radi savršeno.
- **Dobra praksa (Black-Box / Ponašajno testiranje)**: Testiranje onoga što korisnik zapravo vidi i radi. Na primer, klik na dugme "Dodaj u korpu" i provera da li se tekst u zaglavlju promenio na "Korpa (1)". Korisnika (a i naš test) ne zanima kako se interna varijabla zove, već krajnji efekat u DOM-u.

#### Kako RTL podstiče ovu praksu?
RTL nudi metode za pronalaženje elemenata (Query Methods) koje imitiraju kako korisnik pretražuje stranicu:
- `getByRole('button', { name: /Dodaj/i })`: Pronalazi dugme na osnovu njegove pristupačne uloge i teksta. Korisnik ne traži `<button class="btn-primary">`, već dugme na kome piše "Dodaj".
- `getByPlaceholderText('Marko Marković')`: Pronalazi polje za unos na način na koji ga korisnik identifikuje na formi.
- `getByText('Brembo Brake Disc Set')`: Pronalazi tekstualni sadržaj koji se ispisuje na ekranu.

---

### 1.3 Mrežno Mockovanje: Zašto Mock Service Worker (MSW)?
Kada komponenta pri montiranju šalje HTTP zahteve backendu (npr. `fetch('/api/parts')`), moramo simulirati te pozive jer u jediničnim testovima nemamo pokrenut backend server.

Ranije se to radilo "špijuniranjem" globalne fetch metode (`vi.spyOn(window, 'fetch')`), ali to ima velike nedostatke (nesta stabilnost, komplikovano vraćanje različitih odgovora za različite URL-ove).

**Mock Service Worker (MSW)** rešava ovaj problem presretanjem mrežnih zahteva na nivou mrežnog protokola (kroz Service Worker u pretraživaču ili presretač u Node.js-u).

```
[ React Komponenta (Fetch) ] 
            │
            ▼ (Šalje HTTP zahtev na http://localhost:8080/api/parts)
    [ MSW Presretač ]  ◄─── Presreće zahtev pre nego što napusti okruženje
            │
            ├─► Proverava definisane hendlere (handlers)
            ├─► Vraća simulirani HttpResponse.json(mockData)
            ▼
[ React prima podatke kao da dolaze sa pravog servera ]
```

#### Prednosti MSW-a za studente:
1. **Deklarativan kod**: Pišemo hendlere koji izgledaju kao mini-ekspres rute na backendu (`http.get('/api/parts', () => ...)`).
2. **Realno ponašanje**: Aplikacija se testira sa identičnim mrežnim kodom koji koristi u produkciji.
3. **Simulacija grešaka**: Lako možemo simulirati pad mreže vraćanjem `HttpResponse.error()`, čime testiramo stabilnost naše klijentske aplikacije u kriznim situacijama.

---

## 2. End-to-End (E2E) Testiranje pomoću Playwright-a

E2E testiranje se nalazi na **samom vrhu softverske piramide testiranja**. Ono pruža najveći nivo sigurnosti (High Confidence) jer testira kompletan integrisan sistem (frontend + backend + mrežni sloj + prava baza podataka).

### 2.1 Kako radi Playwright?
Za razliku od RTL-a koji renderuje komponente u simulirani JSDOM, Playwright pokreće **pravi pretraživač** (Chromium, Firefox ili WebKit) u pozadini (headless) ili vidljivo (headed) i upravlja njime preko protokola za otklanjanje grešaka (npr. Chrome DevTools Protocol).

```
   [ Playwright Test Runner ]
               │
               ▼ (Upravljačko-automatizovane komande preko protokola)
┌──────────────────────────────────────────────┐
│           Realan Browser (Chromium)          │
│                                              │
│  [ React SPA ] ───HTTP───► [ Spring Boot ]  │
│                                  │           │
│                                 JPA          │
│                                  ▼           │
│                            [ SQLite DB ]     │
└──────────────────────────────────────────────┘
```

---

### 2.2 Tri Zlatna Pravila E2E Testiranja

#### 1. Auto-Waiting (Automatsko čekanje)
Savremene veb aplikacije su asinhrone (čekaju odgovore sa servera, vrše animacije prelaza). U starijim alatima (poput Seleniuma), testovi su često padali jer bi pokušali da kliknu na dugme koje se još nije učitalo na ekranu (to se rešavalo nebezbednim naredbama poput `sleep(3000)`).

Playwright ima ugrađen mehanizam **Auto-Waiting-a**. Pre nego što izvrši bilo koju akciju (klik, unos teksta, provera vidljivosti), Playwright proverava niz preduslova (Actionability Checks):
- Da li je element prisutan u DOM-u?
- Da li je vidljiv na ekranu (nije sakriven sa `display: none`)?
- Da li je stabilan (ne kreće se usled CSS tranzicija)?
- Da li je omogućen (`enabled`)?

Tek kada su svi uslovi ispunjeni, akcija se izvršava. Ovo eliminiše "flaky" (nestabilne) testove.

#### 2. Izbegavanje konflikta sa Striktnim režimom (Strict Mode)
U Playwright-u, svi lokatori podrazumevano rade u **striktnom režimu**. Ako napišete:
`await page.locator('span:has-text("1")').click();`
i na stranici se pojavi više elemenata koji sadrže broj "1" (npr. količina artikla `x1`, ID porudžbine `1`, korisničko ime `user_1`), Playwright će prekinuti izvršavanje testa i prijaviti grešku: **"strict mode violation: resolved to 5 elements"**.

**Kako ovo rešiti?**
- Koristite specifičnije CSS selektore: `.font-mono` za cene, `.order-card` za kartice.
- Koristite filtere: `locator('.font-mono').filter({ hasText: 'Porudžbina:' })`.
- Ako svesno želite prvi element, upotrebite `.first()`.

#### 3. Izolacija stanja i dinamički podaci
E2E testovi vrše upise u pravu bazu podataka. Ako kreiramo korisnika sa imenom "marko" i pokrenemo test dva puta, drugi put će test pasti jer je korisničko ime "marko" već zauzeto u bazi podataka.

**Rešenje**:
- Koristite generator jedinstvenih testnih podataka (npr. dodavanje slučajnog broja ili vremenskog žiga: `const username = 'user_' + Date.now();`).
- Obezbedite skripte za čišćenje baze podataka pre ili nakon svakog pokretanja testnog ciklusa.

---

## 3. Uporedni Pregled: Component vs. E2E Testiranje

| Kriterijum | Testiranje Komponenti (RTL + Vitest) | E2E Testiranje (Playwright) |
| :--- | :--- | :--- |
| **Okruženje** | Virtuelni DOM (Node.js/JSDOM) | Realan pretraživač (Chromium, Firefox...) |
| **Brzina** | Izuzetno brzo (stotine testova u sekundi) | Sporije (zahteva podizanje servera i učitavanje stranica) |
| **Zavisnosti** | Sve spoljne zavisnosti i API rute su mockovane | Koristi se pravi API i stvarna baza podataka |
| **Fokus** | Ispravnost renderovanja, filtriranja i lokalnog stanja | Celokupni korisnički tokovi, mrežna integracija i perzistencija |
| **Pouzdanost (Confidence)**| Srednja (garantuje da UI radi ako su podaci ispravni) | Maksimalna (dokazuje da ceo sistem funkcioniše u realnom svetu) |

---

## 4. Analiza E2E Primera iz ApexParts Aplikacije

U našem E2E testu (`flow.spec.ts`), prošli smo kroz sledeći lanac akcija:

1. **Registracija**:
   Unosom dinamičkog imena `e2e_user_${randomSuffix}` osigurali smo da baza podataka nikada ne vrati grešku o dupliranom nalogu.
2. **Kupovina**:
   Klikom na kategoriju "Brakes" aktivirali smo klijentsko filtriranje. Playwright je sačekao da se kartica Brembo pojavi i kliknuo na "Dodaj".
3. **Kasa (Checkout)**:
   Uneti su kontakt podaci i izabran način plaćanja. Klikom na "POTVRDI I PORUČI", klijent je poslao stvarni POST zahtev na Spring Boot backend na portu 8080.
4. **Perzistencija**:
   Spring Boot je primio zahtev, izvršio proračune, umanjio stanje na lageru u SQLite bazi podataka i vratio ID kreirane porudžbine (npr. ID: `2`).
5. **Verifikacija**:
   Playwright je pročitao ID sa ekrana uspeha, kliknuo na dugme za istoriju porudžbina, sačekao učitavanje Dashboard-a i verifikovao da se u tabeli klijentskih porudžbina nalazi tačno kartica sa natpisom `"Porudžbina: 2"`. Ovo je dokazalo da je klijent-server-baza ciklus 100% ispravan.
