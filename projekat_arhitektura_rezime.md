# Dokumentacija Arhitekture i Realizacije Projekta - ApexParts

Ovaj dokument sadrži detaljan pregled arhitekture veb aplikacije **ApexParts** (prodavnica auto-delova) i sveobuhvatan rezime svih radova koji su uspešno realizovani na frontend-u, backend-u, bazi podataka i u okviru celokupnog testnog sistema (Unit, Integration, React i E2E testovi).

---

## 1. Tehnološki Stek i Arhitektonske Uloge

Aplikacija je izgrađena po principu **Client-Server** arhitekture sa sledećim tehnologijama:

```mermaid
graph TD
    subgraph Klijent (React SPA)
        UI[Korisnički interfejs - React + Vite]
        Zustand[Upravljanje stanjem - Zustand Slices]
        Router[Rutiranje - React Router DOM]
        CSS[Stil - Tailwind CSS v4]
    end

    subgraph Server (Spring Boot REST API)
        Controller[Kontroleri - RestControllers]
        Service[Biznis logika - Services]
        Repository[Pristup podacima - JPA Repositories]
    end

    subgraph Baza podataka
        DevDB[(SQLite - apexparts.db)]
        TestDB[(H2 - in-memory)]
    end

    UI --> Zustand
    Zustand --> Router
    Zustand -- HTTP / JSON --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> DevDB
    Repository --> TestDB
```

- **Frontend (React + Vite)**:
  - Single-Page Application (SPA) koji omogućava brzo i fluidno učitavanje bez osvežavanja stranica.
  - **Tailwind CSS v4** za moderan i atraktivan dizajn visokih performansi inspirisan preciznim auto-inženjeringom.
  - **Zustand** za upravljanje stanjem podeljeno u modularne celine (Slices).
- **Backend (Spring Boot 3.3)**:
  - RESTful API sa definisanim endpointovima koji razmenjuju podatke u JSON formatu.
  - **Spring Data JPA** za objektno-relaciono mapiranje.
- **Baza podataka**:
  - **SQLite** (`backend/apexparts.db`) za razvoj i produkciju. Prednost je što ne zahteva pokretanje posebnog servera baze podataka i čuva sve podatke u jednoj datoteci.
  - **H2 in-memory baza** za automatsko integraciono testiranje kako bi testovi bili izolovani i brzi.

---

## 2. Pregled Strukture Koda i Glavnih Datoteka

### 2.1 Frontend Komponente i Stanja (`frontend/src/`)
- [App.tsx](file:///home/luka/Development/IT321-Ispit2/frontend/src/App.tsx): Glavna klijentska komponenta sa konfiguracijom ruta (`/`, `/checkout`, `/special-order`, `/dashboard`, `/login`).
- **Store Slices (`frontend/src/store/`)**:
  - [types.ts](file:///home/luka/Development/IT321-Ispit2/frontend/src/store/types.ts): Definiše TypeScript interfejse za modele podataka (`Part`, `Order`, `User`, `SpecialOrder`, `OrderItem`).
  - [useStore.ts](file:///home/luka/Development/IT321-Ispit2/frontend/src/store/useStore.ts): Kombinuje sve Zustand celine u jedan globalni klijentski store.
  - [authSlice.ts](file:///home/luka/Development/IT321-Ispit2/frontend/src/store/authSlice.ts): Upravlja stanjem korisnika, ulogama (`CLIENT`, `EMPLOYEE`, `ADMIN`, `GUEST`) i tokenima.
  - [partsSlice.ts](file:///home/luka/Development/IT321-Ispit2/frontend/src/store/partsSlice.ts): Preuzimanje kataloga delova, pretraga, fitment filteri i selektor aktivnog vozila.
  - [cartSlice.ts](file:///home/luka/Development/IT321-Ispit2/frontend/src/store/cartSlice.ts): Funkcionalnosti korpe (dodavanje, izmena količine, računanje subtotala, pražnjenje).
  - [ordersSlice.ts](file:///home/luka/Development/IT321-Ispit2/frontend/src/store/ordersSlice.ts): Kreiranje standardnih porudžbina i ažuriranje njihovih statusa od strane zaposlenih.
  - [specialOrdersSlice.ts](file:///home/luka/Development/IT321-Ispit2/frontend/src/store/specialOrdersSlice.ts): Slanje i upravljanje specijalnim upitima za delove.
  - [notificationsSlice.ts](file:///home/luka/Development/IT321-Ispit2/frontend/src/store/notificationsSlice.ts): Upravljanje restock pretplatama na listu obaveštenja.
- **Stranice (`frontend/src/pages/`)**:
  - [Catalog.tsx](file:///home/luka/Development/IT321-Ispit2/frontend/src/pages/Catalog.tsx): Katalog artikala sa filterima kompatibilnosti, pretragom i modalom "Obavesti me".
  - [Checkout.tsx](file:///home/luka/Development/IT321-Ispit2/frontend/src/pages/Checkout.tsx): Kasa, unos podataka, izbor plaćanja (Card/COD) i registracija gostiju nakon naručivanja.
  - [SpecialOrder.tsx](file:///home/luka/Development/IT321-Ispit2/frontend/src/pages/SpecialOrder.tsx): Forma za slanje upita za delove koji se ne nalaze na uobičajenom lageru.
  - [Dashboard.tsx](file:///home/luka/Development/IT321-Ispit2/frontend/src/pages/Dashboard.tsx): Kontrolna tabla za kupce (pregled istorije) i zaposlene/admine (promena statusa porudžbina, CRUD kataloga, odgovaranje na specijalne upite i upravljanje zaposlenima).
  - [Login.tsx](file:///home/luka/Development/IT321-Ispit2/frontend/src/pages/Login.tsx): Registracioni i prijavni portali.

### 2.2 Backend Modul (`backend/src/main/java/com/apexparts/`)
- **Model (JPA Entities)**:
  - [Part.java](file:///home/luka/Development/IT321-Ispit2/backend/src/main/java/com/apexparts/model/Part.java): Artikal u bazi sa poljima za cenu, brend, količinu na lageru, status i listu kompatibilnosti.
  - [Order.java](file:///home/luka/Development/IT321-Ispit2/backend/src/main/java/com/apexparts/model/Order.java) & [OrderItem.java](file:///home/luka/Development/IT321-Ispit2/backend/src/main/java/com/apexparts/model/OrderItem.java): Porudžbine klijenata sa stavkama i cenama u trenutku kupovine.
  - [User.java](file:///home/luka/Development/IT321-Ispit2/backend/src/main/java/com/apexparts/model/User.java): Korisnički nalozi sa definisanim ulogama.
  - [SpecialOrder.java](file:///home/luka/Development/IT321-Ispit2/backend/src/main/java/com/apexparts/model/SpecialOrder.java): Detalji o automobilu klijenta, opis traženog dela, procena dobavljača, rok isporuke i lokacija preuzimanja.
  - [NotificationRequest.java](file:///home/luka/Development/IT321-Ispit2/backend/src/main/java/com/apexparts/model/NotificationRequest.java): Zahtevi za obaveštenja o dostupnosti delova.
- **Service Layer**:
  - [OrderService.java](file:///home/luka/Development/IT321-Ispit2/backend/src/main/java/com/apexparts/service/OrderService.java): Validira postojanje klijenta, dostupne zalihe, računa cenu, postavlja inicijalni status `CREATED`, umanjuje količinu sa stanja i vrši upis u bazu.
  - [PartService.java](file:///home/luka/Development/IT321-Ispit2/backend/src/main/java/com/apexparts/service/PartService.java): CRUD operacije. Kada se status dela promeni u `IN_STOCK`, prolazi kroz listu čekanja i loguje poslata obaveštenja (Email/SMS).
  - [UserService.java](file:///home/luka/Development/IT321-Ispit2/backend/src/main/java/com/apexparts/service/UserService.java): Prijava korisnika (omogućena i preko username-a i preko e-maila), registracija klijenata, i dodavanje novih zaposlenih (dozvoljeno adminima i postojećim zaposlenima).
- **Controllers (REST API)**:
  - [PartController.java](file:///home/luka/Development/IT321-Ispit2/backend/src/main/java/com/apexparts/controller/PartController.java)
  - [OrderController.java](file:///home/luka/Development/IT321-Ispit2/backend/src/main/java/com/apexparts/controller/OrderController.java)
  - [UserController.java](file:///home/luka/Development/IT321-Ispit2/backend/src/main/java/com/apexparts/controller/UserController.java)
- **Config**:
  - [DatabaseSeeder.java](file:///home/luka/Development/IT321-Ispit2/backend/src/main/java/com/apexparts/config/DatabaseSeeder.java): CommandLineRunner koji pri svakom startovanju čiste baze upisuje početne zaposlene (`admin`, `marko`, `ana`) i katalog od 8 artikala.

---

## 3. Realizovan Plan Testiranja i Testne Klase

U skladu sa zahtevima ispita, u potpunosti je realizovan testni sistem koji pokriva sve aspekte piramide testiranja:

### 3.1 Jedinični testovi (Unit Testing) - JUnit 5 + Mockito
Nalaze se u klasi [OrderServiceUnitTest.java](file:///home/luka/Development/IT321-Ispit2/backend/src/test/java/com/apexparts/service/OrderServiceUnitTest.java).
- **Šta se testira**: Metoda `OrderService.createOrder(...)` u potpunoj izolaciji.
- **Mokovane zavisnosti**: `OrderRepository`, `UserRepository`, `PartRepository`.
- **Pokriveni scenariji**:
  1. Uspešno kreiranje porudžbine (umanjenje zaliha, status `CREATED`, tačan iznos).
  2. Pokušaj kreiranja porudžbine sa praznom korpom (baca se `IllegalArgumentException`).
  3. Nepostojeći klijent (baca se izuzetak).
  4. Nedovoljna količina artikla na stanju (baca se izuzetak).
  5. Tačno računanje ukupne cene za više različitih artikala.

### 3.2 Integracioni testovi REST API-ja - Spring Boot Test + MockMvc
Nalaze se u klasi [OrderControllerIntegrationTest.java](file:///home/luka/Development/IT321-Ispit2/backend/src/test/java/com/apexparts/controller/OrderControllerIntegrationTest.java).
- **Šta se testira**: Putanja `Controller -> Service -> Repository -> H2 Database` (H2 baza se podiže u `create-drop` režimu direktno iz anotacije testa).
- **Pokriveni scenariji**:
  1. Uspešno slanje HTTP POST zahteva za kreiranje porudžbine (provera JSON-a, statusa `201 Created` i umanjenja stanja u H2 bazi).
  2. Naručivanje artikla koji je rasprodat (provera statusa `400 Bad Request` i poruke o grešci).
  3. Neautorizovan pristup (provera da klijent sa klijentskim tokenom dobija `403 Forbidden` pri pokušaju menjanja statusa porudžbine).
  4. Tranzicije statusa (provera dozvoljenog toka `CREATED -> PROCESSING -> SHIPPED -> DELIVERED` i odbijanje nedozvoljene tranzicije `DELIVERED -> CREATED`).

### 3.3 Testovi React Komponenti - Vitest + React Testing Library + MSW
Nalaze se u datoteci [Catalog.test.tsx](file:///home/luka/Development/IT321-Ispit2/frontend/src/tests/Catalog.test.tsx).
- **Šta se testira**: Ponašanje korisničkog interfejsa u JSDOM okruženju, presrećući mrežne zahteve preko Mock Service Worker-a (MSW).
- **Pokriveni scenariji**:
  1. Prikaz svih artikala nakon uspešnog API učitavanja.
  2. Filtriranje artikala prema kategoriji i polju pretrage.
  3. Dodavanje dostupnog artikla u korpu (promena Zustand stanja).
  4. Skrivanje opcije "Dodaj" (i zamena sa "Obavesti me") kada artikal nije na stanju.
  5. Prikaz modalnog dijaloga "Obavesti me" za rasprodate artikle.
  6. Prikaz crvene poruke o grešci na ekranu kada je Spring Boot API nedostupan (simulirano preko MSW `HttpResponse.error()`).
  7. Uspešno slanje porudžbine kroz checkout formu na mockovani backend i pražnjenje korpe.

### 3.4 End-to-End (E2E) Testovi - Playwright
Nalaze se u datoteci [flow.spec.ts](file:///home/luka/Development/IT321-Ispit2/frontend/e2e/flow.spec.ts).
- **Šta se testira**: Celokupan tok u realnom pretraživaču komunicirajući sa pokrenutim serverima na portu `5174` (React) i `8080` (Spring Boot API).
- **E2E Scenario**:
  1. Otvaranje stranice za prijavu.
  2. Registracija novog klijenta sa jedinstvenim imenom i lozinkom.
  3. Preusmeravanje na početnu stranu i provera imena klijenta u zaglavlju.
  4. Filtriranje kataloga po kategoriji "Brakes".
  5. Dodavanje artikla `Brembo Sport Brake Disc Set (Front)` u korpu.
  6. Otvaranje korpe i odlazak na checkout (`IDI NA PLAĆANJE`).
  7. Popunjavanje adrese dostave i biranje plaćanja pouzećem (COD).
  8. Slanje porudžbine i očitavanje broja generisane porudžbine sa ekrana.
  9. Odlazak na kontrolnu tablu (`DASHBOARD`) klijenta.
  10. Provera da se generisana porudžbina sa tačnim ID-jem uspešno nalazi u istoriji kupovina klijenta.

---

## 4. Rezultati Izvršavanja Testova

Sve testne komponente su pokrenute lokalno i daju **100% uspešan rezultat**:

1. **Backend testovi (Surefire)**:
   ```bash
   [INFO] Tests run: 13, Failures: 0, Errors: 0, Skipped: 0
   [INFO] BUILD SUCCESS
   ```
2. **Frontend testovi (Vitest)**:
   ```bash
   ✓ src/tests/Catalog.test.tsx (7 tests) 500ms
     ✓ React Frontend - Auto Parts Store Testing Suite (7)
       ✓ renders all parts after successful loading from API
       ✓ filters parts according to category and search query
       ✓ adds available in-stock part to cart
       ✓ does not show "Add to Cart" button when item is OUT_OF_STOCK
       ✓ renders "Notify Me" option and opens contact modal for out-of-stock part
       ✓ displays connection error message when Spring Boot API is down
       ✓ successfully submits order to backend via API call
   
   Test Files  1 passed (1)
        Tests  7 passed (7)
   ```
3. **E2E testovi (Playwright)**:
   ```bash
   Running 1 test using 1 worker
   [1/1] …ent Flow (Register -> Filter -> Add to Cart -> Checkout -> Check History)
   [E2E TEST] Generated Order ID: 2
     1 passed (2.7s)
   ```
