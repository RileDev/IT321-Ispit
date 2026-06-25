# Plan Testiranja - ApexParts Auto Delovi

Ovaj dokument sadrži zvaničan i detaljan plan testiranja, tabelu slučajeva korišćenja, test scenarije i prateću dokumentaciju za jedinične, integracione, React i E2E testove aplikacije **ApexParts**, kreirane u skladu sa zahtevima zadatka.

---

## 1. Tabela testiranja na osnovu slučajeva korišćenja

Tabela u nastavku prikazuje slučajeve korišćenja (Use Cases) aplikacije, funkcije koje se testiraju, inicijalno stanje sistema, ulaze i očekivane izlaze.

| Slučaj korišćenja | Funkcija koja se testira | Inicijalno stanje sistema | Ulazni podaci | Očekivani izlaz |
| :--- | :--- | :--- | :--- | :--- |
| **UC-01: Registracija klijenta** | `registerClient()` | Korisnik sa korisničkim imenom "johan" ne postoji u bazi podataka. | username="johan", password="password123", email="johan@mail.com", phone="060111222" | Korisnik je uspešno kreiran u bazi sa ulogom `CLIENT`. Vraća se status `201 Created` sa podacima korisnika. |
| **UC-02: Prijavljivanje korisnika** | `verifyLogin()` | Registrovan zaposleni korisnik "marko" postoji u bazi podataka sa lozinkom "marko". | usernameOrEmail="marko", password="marko" | Vraća se uspešna prijava (`200 OK`) sa JWT tokenom i detaljima o ulozi `EMPLOYEE`. |
| **UC-03: Pretraga artikala po filterima** | `getAllParts()` | Katalog delova sadrži inicijalno učitane artikle sa različitim kategorijama, brendovima i kompatibilnostima. | Izabrana kategorija: "Brakes", brend: "Brembo", kompatibilnost: "Audi A4" | Katalog se filtrira i prikazuju se isključivo kočioni diskovi proizvođača "Brembo" koji su kompatibilni sa modelom "Audi A4". |
| **UC-04: Dodavanje artikla u korpu** | `addToCart()` | Korpa klijenta je trenutno prazna. | Klik na dugme "Dodaj u korpu" za artikal ID 10 ("Brembo Discs"), količina: 2. | Korpa se ažurira i sadrži 1 stavku sa artiklom ID 10, količina je postavljena na 2, a subtotal je 2 * cena artikla. |
| **UC-05: Plaćanje pouzećem** | `createOrder()` | Korpa sadrži artikle. Klijent pokreće proces plaćanja. | Adresa isporuke: "Bulevar Kralja Aleksandra 12", plaćanje: "CASH_ON_DELIVERY", email: "johan@mail.com" | Porudžbina je kreirana u bazi sa statusom `CREATED`. Količine naručenih artikala na stanju u bazi su umanjene. Korpa je ispražnjena. |
| **UC-06: Opcija "Obavesti me"** | `registerNotification()` | Artikal ID 3 ("K&N Filter") je van stanja (`OUT_OF_STOCK`, količina = 0). | Klijent klikće na "Obavesti me", bira kanal "EMAIL" i unosi adresu "kupac@mail.com". | Zahtev za obaveštenje je uspešno sačuvan u bazi. Kada se stanje artikla promeni na `IN_STOCK`, ispaljuje se obaveštenje koje se loguje u konzoli. |
| **UC-07: Specijalno poručivanje** | `createSpecialOrder()` | Nema aktivnih specijalnih upita za delove u sistemu. | Auto: "BMW 3 Series 2018", Motor: "2.0D", Opis dela: "Pumpa visokog pritiska", Email: "kupac@mail.com" | Specijalni upit je sačuvan u bazi sa statusom `PENDING`. Zaposleni može da ga vidi na svojoj kontrolnoj tabli. |
| **UC-08: Obrada porudžbine od strane zaposlenog** | `updateOrderStatus()` | Porudžbina sa ID-jem 1 je kreirana i nalazi se u početnom statusu `CREATED`. | Zaposleni menja status porudžbine u `PROCESSING`. | Status porudžbine se menja u `PROCESSING`. Naknadni prelazak u `SHIPPED` pa `DELIVERED` je omogućen. Nedozvoljeni prelazak nazad (npr. sa `DELIVERED` na `CREATED`) je odbijen uz grešku. |

---

## 2. Test Plan Aplikacije

### 2.1 Cilj i obim testiranja
Cilj testiranja je verifikacija ispravnosti rada sistema za prodaju auto-delova **ApexParts** kroz sve slojeve softverske arhitekture. Obim testiranja obuhvata:
- Validaciju korisničkog interfejsa i korisničkog iskustva na frontend strani (React + Zustand).
- Validaciju biznis logike u servisnom sloju i perzistencije podataka na backend strani (Spring Boot + SQLite/H2).
- Validaciju mrežne komunikacije i ispravnosti REST API endpointova.
- Verifikaciju kompletnog toka podataka od registracije do provere istorije porudžbina.

### 2.2 Funkcionalnosti koje će biti testirane
- Registracija klijenata, prijavljivanje korisnika i autorizacija na osnovu JWT tokena (uloge `CLIENT`, `EMPLOYEE`, `ADMIN`).
- Pretraga kataloga i filtriranje po kategoriji, brendu i kompatibilnosti vozila.
- Upravljanje korpom (dodavanje, izmena količine, brisanje, preračunavanje ukupne cene).
- Kreiranje standardnih porudžbina sa izabranim načinom plaćanja (Card vs COD) i ažuriranje zaliha na stanju.
- Prijava na listu obaveštenja za artikle koji nisu na stanju i okidanje obaveštenja.
- Specijalno poručivanje nestandardnih delova i upravljanje tim upitima od strane zaposlenih.
- Upravljanje statusima porudžbina kroz definisani tok stanja.
- Administracija zaposlenih.

### 2.3 Funkcionalnosti koje nisu obuhvaćene testiranjem
- Integracija sa stvarnim eksternim servisom za procesiranje platnih kartica (simulirano lokalno na frontend i backend nivou).
- Slanje pravih e-mailova i SMS poruka (testira se samo logovanje i ispaljivanje događaja).

### 2.4 Vrste testiranja koje će biti primenjene
1. **Jedinično testiranje (Unit testing)**: Testiranje servisnih klasa (`OrderService`, `PartService`, `UserService`) u izolaciji. Zavisnosti (repozitorijumi) se menjaju Mockito mockovima kako bi se testirala isključivo biznis logika.
2. **Integraciono testiranje**: Testiranje saradnje više komponenti (Controller -> Service -> Repository -> baza podataka) uz podizanje Spring Boot konteksta i H2 in-memory baze.
3. **Testiranje REST API-ja**: Provera HTTP statusa, zaglavlja i JSON tela kroz MockMvc za sve ključne rute (uključujući simulaciju JWT autorizacije).
4. **Testiranje React komponenti**: Testiranje UI interakcija i ponašanja komponenti (pretraga, korpa, plaćanje) u JSDOM okruženju pomoću Vitest-a i React Testing Library-ja, uz MSW za mockovanje HTTP zahteva.
5. **Sistemsko testiranje**: Integracija celokupnog toka podataka kroz aplikaciju od korisničkog unosa na frontendu do upisa u bazu na backendu.
6. **Testiranje prihvatljivosti (Acceptance / E2E testing)**: Simulacija realnog ponašanja krajnjeg korisnika u pravom veb čitaču (Chrome/Firefox) kroz automatizovani Playwright scenario.

### 2.5 Testno okruženje
- **Operativni sistem**: Linux Ubuntu (ili ekvivalentan)
- **Runtime**: Java JDK 21+ / Node.js v20+
- **Baza podataka**: H2 in-memory za integracione testove; SQLite za razvojno i E2E testno okruženje.

### 2.6 Alati i biblioteke za testiranje
- **Backend (Spring Boot)**: JUnit 5, Mockito, Spring Boot Starter Test, MockMvc, H2 Database Driver.
- **Frontend (React)**: Vitest, React Testing Library, JSDOM, Mock Service Worker (MSW).
- **E2E**: Playwright Test.

### 2.7 Kriterijumi za početak i završetak testiranja
- **Kriterijumi za početak**:
  - Izvorni kod backend aplikacije se uspešno kompajlira bez grešaka.
  - Frontend aplikacija se uspešno gradi (`npm run build` prolazi bez grešaka).
  - Baza podataka je inicijalizovana sa početnom šemom.
- **Kriterijumi za završetak**:
  - Svi implementirani jedinični, integracioni, frontend i E2E testovi prolaze uspešno (100% pass rate).
  - Pokrivenost koda testovima na backendu iznosi najmanje 80%.

### 2.8 Način evidentiranja pronađenih grešaka
Pronađene greške se automatski evidentiraju kroz:
- Konzolu i Maven test izveštaje (XML/HTML izveštaji generisani od strane Surefire plugina).
- Konzolu Vitest-a sa detaljnim prikazom palih asercija.
- Playwright HTML izveštaje sa snimcima ekrana (screenshots) i video zapisima neuspešnih E2E koraka.
- Pregledni dokument o realizaciji testova (`walkthrough.md`).

### 2.9 Glavni rizici pri testiranju
- **Konkurentni pristup SQLite bazi podataka**: Može doći do zaključavanja baze (`SQLITE_BUSY`) tokom paralelnog izvršavanja testova. Rešava se korišćenjem H2 in-memory baze sa izolacijom transakcija za API testove, i čišćenjem SQLite baze pre E2E testova.
- **Flaky E2E testovi**: Nestabilnost testova usled asinhronih mrežnih kašnjenja. Rešava se korišćenjem Playwright-ovog auto-waiting mehanizma i jasnih lokatora elemenata.

---

## 3. Tabela sa test scenarijima (scenariji TS-01 do TS-08)

| ID | Funkcionalnost | Preduslovi | Koraci testiranja | Testni podaci | Očekivani rezultat | Prioritet |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TS-01** | Registracija klijenta | Korisnik nije prijavljen na sistem. | 1. Idi na stranicu za Prijavu.<br>2. Izaberi tab "Klijent", pa pod-tab "Registracija".<br>3. Popuni formu i klikni "Registruj se". | username="johan", email="johan@mail.com", phone="060111222", password="pass" | Korisnik je registrovan, automatski ulogovan i preusmeren na katalog. Prikazuje se dobrodošlica. | Visok |
| **TS-02** | Prijavljivanje zaposlenog | Zaposleni korisnik postoji u bazi podataka. | 1. Idi na stranicu za Prijavu.<br>2. Izaberi tab "Zaposleni".<br>3. Unesi korisničko ime/email i lozinku.<br>4. Klikni "Prijavi se". | username="marko", password="marko" | Zaposleni je uspešno ulogovan i automatski preusmeren na Kontrolnu Tablu (Dashboard). | Visok |
| **TS-03** | Pretraga artikala po filterima | Korisnik se nalazi na stranici Kataloga. | 1. Unesi "Brembo" u pretragu.<br>2. Izaberi kategoriju "Brakes".<br>3. Izaberi brend "Brembo" u filterima. | Pretraga="Brembo", Kategorija="Brakes", Brend="Brembo" | Prikazuju se isključivo artikli koji pripadaju kočionim sistemima i brendu Brembo. | Srednji |
| **TS-04** | Dodavanje artikla u korpu | Korisnik se nalazi na stranici Kataloga. | 1. Klikni na dugme "Dodaj u korpu" na artiklu koji je na stanju.<br>2. Otvori korpu klikom na ikonicu u zaglavlju. | Artikal="Brembo Sport Brake Disc Set", Količina=1 | Brojač stavki u zaglavlju se menja sa 0 na 1. Artikal se nalazi u korpi sa tačnom cenom. | Visok |
| **TS-05** | Plaćanje pouzećem | Korpa sadrži artikle, pokrenut Checkout. | 1. Klikni na dugme "Nastavi na plaćanje".<br>2. Unesi adresu isporuke.<br>3. Izaberi opciju "Plaćanje pouzećem (COD)".<br>4. Klikni "Završi porudžbinu". | Ime="Luka", Adresa="Bul. Kralja Aleksandra 12", Telefon="060111222", Email="kupac@mail.com", Plaćanje="COD" | Kreira se račun sa ID-jem porudžbine i potvrdom. Korpa se prazni. Količina na zalihama je umanjena. | Visok |
| **TS-06** | Opcija "Obavesti me" | Artikal je rasprodat (van stanja). | 1. Klikni na dugme "Obavesti me" na artiklu.<br>2. Izaberi kanal obaveštenja (Email).<br>3. Unesi email adresu i klikni "Aktiviraj". | Kanal="EMAIL", Kontakt="kupac@mail.com" | Prijava za obaveštenje je zabeležena. Prikazuje se zelena poruka uspeha. | Srednji |
| **TS-07** | Specijalno poručivanje | Korisnik je na stranici za specijalne upite. | 1. Unesi marku/model vozila.<br>2. Unesi detaljan opis potrebnog dela.<br>3. Unesi kontakt email.<br>4. Klikni "Pošalji upit". | Vozilo="Audi A4 2017", Opis="DPF Filter izduvnog sistema", Email="kupac@mail.com" | Upit je sačuvan u bazi sa statusom PENDING. Prikazuje se poruka o uspešnom slanju. | Srednji |
| **TS-08** | Obrada porudžbine od strane zaposlenog | Porudžbina postoji u bazi sa statusom CREATED. | 1. Prijavi se kao zaposleni.<br>2. Idi na Kontrolnu Tablu.<br>3. Kod porudžbine klikni na kvačicu za promenu statusa. | ID porudžbine = 1, Sledeći status = "PROCESSING" | Status porudžbine se menja u PROCESSING. Istorija prikazuje ispravan status. | Visok |

---

## 4. Detaljan opis jediničnih testova (Zadatak 2)

Jedinični testovi su podeljeni u tri klase na backendu:

### 4.1 Klasa [OrderServiceUnitTest.java](backend/src/test/java/com/apexparts/service/OrderServiceUnitTest.java)
- **Jedinica koja se testira (Unit Under Test)**:
  - Metoda `OrderService.createOrder(Long clientId, CreateOrderRequest request)`. Testira se isključivo biznis logika i ponašanje ove metode pod različitim uslovima, nezavisno od drugih slojeva aplikacije.
- **Simulirane zavisnosti (Mocked Dependencies)**:
  - `OrderRepository`, `UserRepository`, `PartRepository` su zamenjeni Mockito mock objektima.
- **Zašto se ne koristi prava baza podataka**:
  - Jedinični testovi moraju biti brzi (u milisekundama) i izolovani. Prava baza usporava izvršavanje i unosi rizik zavisnosti od spoljnog okruženja ili prethodnih testova.
- **Testovi**:
  1. `createOrder_Successful`: Uspešno kreiranje porudžbine (status `CREATED`, umanjenje zaliha, tačna ukupna cena).
  2. `createOrder_EmptyCart`: Izuzetak ako je korpa prazna.
  3. `createOrder_ClientDoesNotExist`: Izuzetak ako klijent ne postoji u bazi.
  4. `createOrder_InsufficientStock`: Izuzetak ako tražena količina nekog artikla premašuje stanje na zalihama.
  5. `createOrder_CorrectTotalPriceCalculation`: Provera tačne kalkulacije za više artikala.

### 4.2 Klasa [PartServiceUnitTest.java](backend/src/test/java/com/apexparts/service/PartServiceUnitTest.java)
- **Jedinica koja se testira (Unit Under Test)**:
  - Metode `PartService.updatePart(...)` i `PartService.deletePart(...)`.
- **Testovi**:
  1. `updatePart_TriggersNotificationsOnRestock`: Proverava da se, kada artikal prelazi iz `OUT_OF_STOCK` u `IN_STOCK`, klijentima sa liste čekanja automatski okidaju obaveštenja i status postavlja na `notified = true`.
  2. `deletePart_ThrowsExceptionIfNotFound`: Proverava da se prilikom brisanja nepostojećeg artikla baca izuzetak i sprečava dalji korak.

### 4.3 Klasa [UserServiceUnitTest.java](backend/src/test/java/com/apexparts/service/UserServiceUnitTest.java)
- **Jedinica koja se testira (Unit Under Test)**:
  - Metode `UserService.verifyLogin(...)` i `UserService.addEmployee(...)`.
- **Testovi**:
  1. Prijavljivanje preko korisničkog imena vs. prijavljivanje preko e-mail adrese.
  2. Pokušaj prijave sa pogrešnom lozinkom ili nepostojećim nalogom.
  3. Dodavanje zaposlenih (dozvoljeno administratorima/zaposlenima, a blokirano sa `SecurityException` za klijente).

---

## 5. Detaljan opis integracionih testova REST API-ja (Zadatak 3)

Integracioni testovi su implementirani u klasi [OrderControllerIntegrationTest.java](backend/src/test/java/com/apexparts/controller/OrderControllerIntegrationTest.java).

- **Putanja komponenti koje se zajednički testiraju**:
  - `Controller` (REST API endpoint) -> `Service` (Biznis logika) -> `Repository` (Pristup podacima) -> `Testna baza podataka` (in-memory H2 baza).
  - Koristi se `@SpringBootTest` sa konfiguracijom in-memory H2 baze podataka.

### Implementirani integracioni testovi:
1. **Uspešno kreiranje porudžbine (`placeOrder_Success`)**:
   - Šalje POST zahtev na `/api/orders/{clientId}`.
   - Verifikuje HTTP status `201 Created`, JSON odgovor, i promenu zaliha na stanju u H2 bazi podataka.
2. **Poručivanje artikla koji nije na stanju (`placeOrder_OutOfStock`)**:
   - Šalje zahtev za artikal koji ima status `OUT_OF_STOCK` i zalihe 0.
   - Verifikuje HTTP status `400 Bad Request` i poruku o nedostupnosti artikla.
3. **Neautorizovan pristup (`updateStatus_UnauthorizedClient`)**:
   - Klijent sa ulogom `CLIENT` pokušava da izmeni status porudžbine slanjem PATCH zahteva na `/api/employee/orders/{id}/status`.
   - Verifikuje HTTP status `403 Forbidden`.
4. **Promena statusa porudžbine (`updateStatus_StateTransitions`)**:
   - Zaposleni (`EMPLOYEE`) menja status porudžbine kroz dozvoljeni lanac (`CREATED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`).
   - Verifikuje uspešnu izmenu, kao i odbijanje nedozvoljene izmene nazad (`DELIVERED` -> `CREATED` uz status `400 Bad Request`).

---

## 6. Plan testova React frontenda (Zadatak 4)

Testovi za React frontend su podeljeni na UI testove komponenti i jedinične testove stanja (Zustand).

### 6.1 UI testovi komponenti ([Catalog.test.tsx](frontend/src/tests/Catalog.test.tsx))
Koriste se **Vitest**, **React Testing Library** i **Mock Service Worker (MSW)**.
- **Pokriveni scenariji**:
  1. Prikaz svih artikala nakon uspešnog API učitavanja.
  2. Filtriranje artikala prema kategoriji i polju pretrage.
  3. Dodavanje dostupnog artikla u korpu (ažurira Zustand stanje korpe).
  4. Onemogućavanje dugmeta za dodavanje u korpu kada artikal nije na stanju.
  5. Prikaz opcije "Obavesti me" za artikle van stanja.
  6. Prikaz crvene poruke o grešci na ekranu kada je Spring Boot API nedostupan (mrežni pad).
  7. Uspešno slanje porudžbine backend aplikaciji kroz formu kase (Checkout).

### 6.2 Jedinični testovi stanja prodavnice ([store.test.ts](frontend/src/tests/store.test.ts))
Izolovani testovi Zustand stanja (bez montiranja HTML komponenti).
- **Pokriveni scenariji**:
  1. `addToCart` akumulira količinu na postojećoj stavci umesto dupliranja reda u korpi.
  2. `updateCartQuantity` postavlja količinu na minimalno 1 ukoliko se prosledi negativna vrednost ili nula.
  3. `clearCart` uspešno prazni celu korpu.
  4. `setActiveVehicle` ispravno postavlja i čisti podatke o odabranom automobilu u widgetu.

---

## 7. E2E testiranje pomoću Playwright-a (Dodatni poeni)

E2E test simulira celokupan tok korisničkog iskustva u realnom pretraživaču, komunicirajući sa pokrenutim frontend-om i backend-om.

### E2E scenario ([flow.spec.ts](frontend/e2e/flow.spec.ts)):
1. Korisnik otvara aplikaciju.
2. Otvara formu za registraciju i kreira novog klijenta sa jedinstvenim podacima.
3. Automatski se prijavljuje na sistem i proverava ime klijenta u zaglavlju.
4. Pomoću filtera kategorije "Brakes" pronalazi Brembo kočioni disk.
5. Dodaje artikal u korpu.
6. Otvara korpu i popunjava podatke za dostavu na kasi, birajući plaćanje pouzećem (COD).
7. Potvrđuje porudžbinu i očitava ID generisane porudžbine.
8. Otvara profil/kontrolnu tablu i verifikuje da se nova porudžbina nalazi tamo sa ispravnim podacima i statusom `CREATED`.
