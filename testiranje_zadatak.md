Za datu aplikaciju:
1.	Napraviti tabelu za testiranje na osnovu slučajeva korišćenja. Tabela treba da sadrži polja: Slučaj korišćenja, funkcija koja se testira, inicijalno stanje sistema, ulazi očekivani izlaz. (5 poena)

*****
## Zadaci

Pretpostaviti da je aplikacija realizovana korišćenjem sledećih tehnologija:

* frontend: React i Vite;
* backend: Spring Boot REST API;
* baza podataka: PostgreSQL;
* autentifikacija i autorizacija: Spring Security i JWT;
* komunikacija frontenda i backenda: HTTP/JSON;
* elektronska pošta i SMS poruke realizuju se preko eksternih servisa.

Za datu aplikaciju potrebno je uraditi sledeće zadatke.

### 1. Izrada plana testiranja aplikacije — 7 poena

Napraviti test plan za aplikaciju prodavnice auto-delova.

Test plan treba da sadrži:

1. cilj i obim testiranja;
2. funkcionalnosti koje će biti testirane;
3. funkcionalnosti koje nisu obuhvaćene testiranjem;
4. vrste testiranja koje će biti primenjene:

   * jedinično testiranje;
   * integraciono testiranje;
   * testiranje REST API-ja;
   * testiranje React komponenti;
   * sistemsko testiranje;
   * testiranje prihvatljivosti;
5. testno okruženje;
6. alate i biblioteke za testiranje;
7. kriterijume za početak i završetak testiranja;
8. način evidentiranja pronađenih grešaka;
9. glavne rizike pri testiranju.

U okviru testnog plana napraviti tabelu sa najmanje osam test scenarija. Tabela treba da sadrži sledeća polja:

| ID | Funkcionalnost | Preduslovi | Koraci testiranja | Testni podaci | Očekivani rezultat | Prioritet |
| -- | -------------- | ---------- | ----------------- | ------------- | ------------------ | --------- |

Test scenariji treba da obuhvate najmanje sledeće funkcionalnosti:

* registraciju klijenta;
* prijavljivanje korisnika;
* pretragu artikala po filterima;
* dodavanje artikla u korpu;
* plaćanje karticom ili pouzećem;
* opciju „Obavesti me“;
* specijalno poručivanje dela;
* obradu porudžbine od strane zaposlenog.

---

### 2. Jedinično testiranje Spring Boot aplikacije korišćenjem JUnit-a — 8 poena

Korišćenjem biblioteka **JUnit 5** i **Mockito** napraviti jedinične testove za servisnu klasu koja realizuje poručivanje artikala.

Pretpostaviti da servis sadrži metodu:

```java
Order createOrder(Long clientId, CreateOrderRequest request);
```

Metoda treba da:

1. proveri da li klijent postoji;
2. proveri da li korpa sadrži najmanje jedan artikal;
3. proveri dostupnu količinu svakog artikla;
4. izračuna ukupnu cenu porudžbine;
5. postavi početni status porudžbine na `CREATED`;
6. umanji količinu artikala na stanju;
7. sačuva porudžbinu u bazi.

Napisati najmanje pet JUnit testova:

* uspešno kreiranje porudžbine;
* pokušaj kreiranja porudžbine sa praznom korpom;
* klijent ne postoji;
* jedan od artikala nije dostupan u traženoj količini;
* tačno izračunavanje ukupne cene porudžbine.

Repozitorijumi treba da budu zamenjeni Mockito objektima. Za svaki test koristiti obrazac:

**Arrange – Act – Assert.**

Pored implementacije testova, ukratko objasniti:

* koji deo sistema predstavlja jedinicu koja se testira;
* koje zavisnosti su simulirane;
* zbog čega se u datim testovima ne koristi prava baza podataka.

---

### 3. Integraciono testiranje Spring Boot REST API-ja — 8 poena

Napraviti integracione testove za REST API pomoću:

* `@SpringBootTest`;
* `MockMvc` ili `TestRestTemplate`;
* testne baze podataka H2 ili PostgreSQL baze pokrenute pomoću Testcontainers biblioteke.

Integracionim testovima obuhvatiti kompletan tok obrade porudžbine:

1. registracija klijenta;
2. prijavljivanje klijenta i dobijanje JWT tokena;
3. pretraga artikla;
4. dodavanje dostupnog artikla u korpu;
5. kreiranje porudžbine;
6. pregled kreirane porudžbine;
7. promena statusa porudžbine od strane zaposlenog.

Potrebno je implementirati najmanje četiri integraciona testa:

#### Test 1 — Uspešno kreiranje porudžbine

Poslati validan HTTP zahtev i proveriti:

* HTTP status odgovora;
* sadržaj JSON odgovora;
* status kreirane porudžbine;
* ukupnu cenu;
* promenu količine artikla u bazi.

#### Test 2 — Poručivanje artikla koji nije na stanju

Proveriti da sistem:

* vraća odgovarajući HTTP status;
* ne kreira porudžbinu;
* ne menja podatke o zalihama;
* vraća razumljivu poruku o grešci.

#### Test 3 — Neautorizovan pristup

Proveriti da klijent ne može da pristupi endpointu namenjenom zaposlenima, na primer:

```http
PATCH /api/employee/orders/{id}/status
```

Očekivati odgovor `403 Forbidden`.

#### Test 4 — Promena statusa porudžbine

Proveriti da zaposleni može da promeni status porudžbine iz:

```text
CREATED → PROCESSING → SHIPPED → DELIVERED
```

Takođe proveriti da nije moguće izvršiti nedozvoljenu promenu, na primer:

```text
DELIVERED → CREATED
```

Za svaki test navesti koje se komponente zajednički testiraju, na primer:

```text
Controller → Service → Repository → testna baza podataka
```

---

### 4. Testiranje React frontenda i povezivanja sa Spring Boot backendom — 7 poena

Korišćenjem alata **Vitest**, **React Testing Library** i, po potrebi, biblioteke **Mock Service Worker – MSW**, testirati korisnički interfejs aplikacije.

Napraviti testove za komponentu za pretragu i poručivanje auto-delova.

Testovima obuhvatiti najmanje sledeće scenarije:

1. prikaz svih artikala nakon uspešnog učitavanja;
2. filtriranje artikala prema proizvođaču vozila, modelu ili kategoriji dela;
3. dodavanje dostupnog artikla u korpu;
4. onemogućavanje dugmeta „Dodaj u korpu“ kada artikal nije na stanju;
5. prikaz opcije „Obavesti me“ za artikal koji nije dostupan;
6. prikaz poruke o grešci kada Spring Boot API nije dostupan;
7. uspešno slanje porudžbine backend aplikaciji.

Najmanje jedan test treba da simulira HTTP komunikaciju između React komponente i Spring Boot API-ja.

Primer toka koji treba testirati:

```text
Korisnik bira filter
→ React šalje GET zahtev
→ Spring Boot vraća rezultate
→ rezultati se prikazuju
→ korisnik dodaje artikal u korpu
→ React šalje POST zahtev
→ prikazuje se potvrda o uspešnoj porudžbini
```

U testovima ne proveravati unutrašnju implementaciju React komponente, već ponašanje koje korisnik može da vidi ili izvrši.

## Ukupno: 30 poena

### Dodatni poeni — najviše 3 poena

Dodatni poeni mogu se ostvariti implementacijom jednog od sledećih proširenja:

* generisanje izveštaja o pokrivenosti koda pomoću JaCoCo-a;
* korišćenje Testcontainers biblioteke za PostgreSQL;
* testiranje eksternog servisa za slanje elektronske pošte pomoću WireMock-a;
* automatsko pokretanje testova kroz GitHub Actions;
* implementacija end-to-end testa pomoću Playwright-a ili Cypress-a.

Primer end-to-end scenarija:

```text
Registracija klijenta
→ prijavljivanje
→ izbor filtera
→ dodavanje artikla u korpu
→ izbor načina plaćanja
→ potvrda porudžbine
→ provera da se porudžbina nalazi u istoriji porudžbina
```