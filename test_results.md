# Izveštaj o Izvršenim Testovima - ApexParts

Ovaj dokument sadrži detaljan spisak svih pokrenutih testova u okviru aplikacije **ApexParts** i njihov trenutni status nakon uspešnog izvršenja celokupnog testnog steka.

---

## 1. Rezime Izvršavanja

| Nivo Testiranja | Tehnologija / Alat | Broj Testova | Status |
| :--- | :--- | :---: | :---: |
| **Jedinični testovi (Backend)** | JUnit 5 + Mockito | 13 | **PASSED** |
| **Integracioni testovi (Backend)** | MockMvc + H2 Database | 4 | **PASSED** |
| **Jedinični testovi stanja (Frontend Store)** | Vitest (Zustand Slices) | 4 | **PASSED** |
| **Integracioni/UI testovi (Frontend)** | Vitest + React Testing Library + MSW | 7 | **PASSED** |
| **E2E testovi (Sistemski)** | Playwright (Desktop Chromium) | 1 | **PASSED** |
| **UKUPNO** | | **29** | **PASSED (100%)** |

---

## 2. Detaljan Spisak Testova i Statusi

### 2.1 Backend Jedinični Testovi (Unit Tests)
Lokacija: `backend/src/test/java/com/apexparts/service/`

- **Klasa `OrderServiceUnitTest`**:
  1. `createOrder_Successful`
     - *Opis*: Uspešno kreiranje porudžbine sa ispravnim klijentom, artiklima na stanju i validnim podacima. Proverava status `CREATED`, smanjenje zaliha i upis u bazu.
     - *Status*: **PASSED**
  2. `createOrder_EmptyCart`
     - *Opis*: Pokušaj kreiranja porudžbine sa praznom korpom. Očekuje se izuzetak `IllegalArgumentException`.
     - *Status*: **PASSED**
  3. `createOrder_ClientDoesNotExist`
     - *Opis*: Pokušaj naručivanja za klijenta koji ne postoji u bazi podataka. Očekuje se izuzetak.
     - *Status*: **PASSED**
  4. `createOrder_InsufficientStock`
     - *Opis*: Naručivanje količine koja premašuje trenutno stanje na lageru. Očekuje se izuzetak i odbijanje čuvanja.
     - *Status*: **PASSED**
  5. `createOrder_CorrectTotalPriceCalculation`
     - *Opis*: Verifikacija tačne matematičke kalkulacije ukupne cene za više različitih artikala sa različitim količinama u korpi.
     - *Status*: **PASSED**

- **Klasa `UserServiceUnitTest`**:
  6. `verifyLogin_Success`
     - *Opis*: Uspešna prijava korisnika unošenjem tačnih kredencijala.
     - *Status*: **PASSED**
  7. `verifyLogin_WrongPassword`
     - *Opis*: Pokušaj prijave sa ispravnim korisničkim imenom ali netačnom lozinkom. Očekuje se odbijanje.
     - *Status*: **PASSED**
  8. `verifyLogin_UserNotFound`
     - *Opis*: Pokušaj prijave sa nepostojećim nalogom. Očekuje se izuzetak.
     - *Status*: **PASSED**
  9. `addEmployee_SuccessByAdmin`
     - *Opis*: Zaposleni/Admin uspešno dodaje novog zaposlenog u sistem.
     - *Status*: **PASSED**
  10. `addEmployee_ForbiddenAsClient`
      - *Opis*: Pokušaj dodavanja zaposlenog od strane klijenta (uloga `CLIENT`). Očekuje se greška bezbednosti (`SecurityException`).
      - *Status*: **PASSED**
  11. `verifyLogin_SuccessfulWithEmail`
      - *Opis*: Uspešna prijava korisnika preko registrovane e-mail adrese.
      - *Status*: **PASSED**

- **Klasa `PartServiceUnitTest`**:
  12. `updatePart_TriggersNotificationsOnRestock`
      - *Opis*: Kada se artikal promeni iz `OUT_OF_STOCK` u `IN_STOCK`, verifikuje da se automatski šalju obaveštenja klijentima sa liste čekanja i da se postavlja status `notified = true`.
      - *Status*: **PASSED**
  13. `deletePart_ThrowsExceptionIfNotFound`
      - *Opis*: Pokušaj brisanja nepostojećeg artikla iz kataloga. Proverava da li se baca izuzetak `IllegalArgumentException` i sprečava brisanje.
      - *Status*: **PASSED**

---

### 2.2 Backend Integracioni Testovi (Integration Tests)
Lokacija: [OrderControllerIntegrationTest.java](backend/src/test/java/com/apexparts/controller/OrderControllerIntegrationTest.java)

- **Klasa `OrderControllerIntegrationTest`**:
  1. `placeOrder_Success`
     - *Opis*: Šalje validan HTTP POST zahtev za kreiranje porudžbine. Verifikuje status `201 Created`, ispravnost JSON odgovora i smanjenje količine artikla na lageru u H2 testnoj bazi podataka.
     - *Status*: **PASSED**
  2. `placeOrder_OutOfStock`
     - *Opis*: Šalje zahtev za kupovinu artikla koji nema dovoljno zaliha. Verifikuje status `400 Bad Request`, promenu zaliha (0 promena) i sadržaj poruke o grešci.
     - *Status*: **PASSED**
  3. `updateStatus_UnauthorizedClient`
     - *Opis*: Pokušaj promene statusa porudžbine od strane običnog klijenta slanjem PATCH zahteva sa klijentskim JWT tokenom. Verifikuje blokadu i status `403 Forbidden`.
     - *Status*: **PASSED**
  4. `updateStatus_StateTransitions`
     - *Opis*: Proverava uspešan prelazak statusa kroz definisani tok stanja (`CREATED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`) i odbijanje nedozvoljene tranzicije (`DELIVERED` -> `CREATED` sa statusom `400 Bad Request`).
     - *Status*: **PASSED**

---

### 2.3 Frontend Jedinični Testovi Stanja (Store Unit Tests)
Lokacija: [store.test.ts](frontend/src/tests/store.test.ts)

- **Test Suite `Zustand Store Unit Tests (State Logic)`**:
  1. `addToCart increments quantity when adding duplicate items instead of adding new lines`
     - *Opis*: Verifikuje da ponovno dodavanje istog dela u korpu akumulira njegovu količinu u postojećoj stavci umesto pravljenja novog reda.
     - *Status*: **PASSED**
  2. `updateCartQuantity clamps negative or zero quantities to minimum of 1`
     - *Opis*: Verifikuje da pokušaj ažuriranja količine u korpi na 0 ili negativne vrednosti automatski ograničava količinu na 1.
     - *Status*: **PASSED**
  3. `clearCart empties the shopping cart list`
     - *Opis*: Proverava da li poziv akcije `clearCart()` uspešno briše sve stavke i vraća korpu u prazan niz `[]`.
     - *Status*: **PASSED**
  4. `setActiveVehicle correctly sets and clears active vehicle in state`
     - *Opis*: Proverava ispravnost postavljanja i čišćenja izabranog vozila u Widgetu za kompatibilnost.
     - *Status*: **PASSED**

---

### 2.4 Frontend Integracioni/UI Testovi Komponenti
Lokacija: [Catalog.test.tsx](frontend/src/tests/Catalog.test.tsx)

- **Test Suite `React Frontend - Auto Parts Store Testing Suite`**:
  1. `renders all parts after successful loading from API`
     - *Opis*: Proverava da li su svi artikli uspešno izrendani na ekranu nakon mockovanog GET odgovora od strane MSW-a.
     - *Status*: **PASSED**
  2. `filters parts according to category and search query`
     - *Opis*: Klikće na dugmad filtera kategorija i unosi tekst pretrage, verifikujući da se prikazuju isključivo odgovarajući delovi.
     - *Status*: **PASSED**
  3. `adds available in-stock part to cart`
     - *Opis*: Klik na dugme "Dodaj" na dostupnom artiklu i provera da se Zustand stanje korpe uvećalo i sadrži tačan artikal.
     - *Status*: **PASSED**
  4. `does not show "Add to Cart" button when item is OUT_OF_STOCK`
     - *Opis*: Proverava da se za artikle koji nisu na stanju ne prikazuje dugme "Dodaj", već isključivo opcija "Obavesti me".
     - *Status*: **PASSED**
  5. `renders "Notify Me" option and opens contact modal for out-of-stock part`
     - *Opis*: Klik na dugme "Obavesti me" otvara modal sa obrascem za unos e-maila ili telefona.
     - *Status*: **PASSED**
  6. `displays connection error message when Spring Boot API is down`
     - *Opis*: Simulira pad servera (MSW vraća mrežnu grešku) i verifikuje prikaz crvenog okvira sa informacijama o nedostupnosti API-ja.
     - *Status*: **PASSED**
  7. `successfully submits order to backend via API call`
     - *Opis*: Popunjava checkout formu na stranici kase i šalje POST zahtev. Verifikuje prikaz ekrana uspeha sa tačnim brojem računa iz MSW odgovora.
     - *Status*: **PASSED**

---

### 2.5 End-to-End Testovi (E2E Tests)
Lokacija: [flow.spec.ts](frontend/e2e/flow.spec.ts)

- **Test Suite `ApexParts Auto Parts Store E2E Tests`**:
  1. `Complete Client Flow (Register -> Filter -> Add to Cart -> Checkout -> Check History)`
     - *Opis*: Kompletan integracioni scenario koji prolazi kroz pretraživač Chromium: otvara stranicu prijavljivanja $\rightarrow$ registruje klijentski nalog sa jedinstvenim podacima $\rightarrow$ filtrira katalog po kategoriji kočnica $\rightarrow$ dodaje Brembo disk u korpu $\rightarrow$ otvara kasu $\rightarrow$ završava kupovinu pouzećem $\rightarrow$ očitava ID $\rightarrow$ otvara profilnu tablu i pronalazi kreiranu porudžbinu u istoriji kupovina sa statusom `CREATED`.
     - *Status*: **PASSED**
