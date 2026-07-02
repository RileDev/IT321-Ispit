# Individualni Testovi - Izveštaj i Dokumentacija

## 1. Jedinični (Unit) Testovi

### Pokretanje testova
Jedinični testovi za servisni sloj se nalaze u klasi [UserServiceUnitTest.java](/backend/src/test/java/com/apexparts/service/UserServiceUnitTest.java). Pokretanjem sledeće komande u terminalu:

```bash
mvn test -Dtest=UserServiceUnitTest
```

dobijeni su sledeći rezultati:
* **Ukupno testova:** 8
* **Failures (Neuspešni):** 0
* **Errors (Greške):** 0
* **Skipped (Preskočeni):** 0
* **Status:** `BUILD SUCCESS`

### Dokumentacija testova za registraciju klijenta
Klasa `UserServiceUnitTest` koristi **Mockito** biblioteku za mock-ovanje zavisnosti (`UserRepository` i `PasswordEncoder`) kako bi se izolovano testirala poslovna logika u `UserService`.

#### 1.1 `registerClient_successfulRegistration`
* **Cilj testa:** Provera da li se klijent uspešno registruje kada su prosleđeni svi obavezni podaci i kada su korisničko ime i email slobodni.
* **Preduslovi (Arrange):**
  * Konfigurisan je mock za `userRepository` da vrati `Optional.empty()` za pretrage po korisničkom imenu i email-u (što znači da su slobodni).
  * Konfigurisan je mock za `passwordEncoder` da za lozinku `"Sifra1234"` vrati enkodovanu lozinku `"encoded_Sifra1234"`.
  * Konfigurisan je mock za `userRepository.save(...)` da vrati prosleđenog korisnika.
* **Izvršenje (Act):** Poziva se metoda `userService.registerClient(user)`.
* **Provere (Assert):**
  * Proverava se da vraćeni `User` nije `null`.
  * Proverava se da je uloga korisnika uspešno postavljena na `"CLIENT"`.
  * Proverava se da je lozinka zamenjena enkodovanom verzijom (`"encoded_Sifra1234"`).
  * Verifikuje se da su jednom pozvane metode `findByUsername`, `findByEmail`, `save` na repozitorijumu i `encode` na enkoderu.

#### 1.2 `registerClient_sameEmail`
* **Cilj testa:** Provera da sistem odbija registraciju i baca izuzetak ukoliko klijent pokuša da se registruje sa email-om koji je već zauzet.
* **Preduslovi (Arrange):**
  * `userRepository.findByEmail(...)` je konfigurisan da vrati postojećeg korisnika sa istim email-om.
* **Izvršenje (Act & Assert):**
  * Proverava se da li je bačen izuzetak `IllegalArgumentException` sa porukom `"Email ime 'luka@gmail.com' je zauzeto."`.
  * Verifikuje se da metoda `save(...)` na repozitorijumu **nikada** nije pozvana (`never()`), čime se garantuje da klijent nije upisan u bazu podataka.

---

## 2. Integracioni Testovi

### Pokretanje testova
Integracioni testovi za REST API se nalaze u klasi [AuthIntegrationTest.java](/backend/src/test/java/com/apexparts/controller/AuthIntegrationTest.java). Pokretanjem sledeće komande u terminalu:

```bash
mvn test -Dtest=AuthIntegrationTest
```

dobijeni su sledeći rezultati:
* **Ukupno testova:** 1
* **Failures (Neuspešni):** 0
* **Errors (Greške):** 0
* **Skipped (Preskočeni):** 0
* **Status:** `BUILD SUCCESS`

### Dokumentacija integracionog testa za registraciju klijenta
Klasa `AuthIntegrationTest` testira integraciju celog toka: **Controller $\rightarrow$ Service $\rightarrow$ Repository $\rightarrow$ Baza podataka (SQLite)** slanjem stvarnog HTTP POST zahteva na endpoint aplikacije.

#### 2.1 `registerClient_successfulRegistration`
* **Putanja endpoint-a:** `POST /api/users/register`
* **JSON Payload zahteva:**
  ```json
  {
    "firstName": "Petar",
    "lastName": "Petrović",
    "username": "petar_petrovic",
    "email": "petar@example.com",
    "password": "Test1234",
    "phone": "061111222"
  }
  ```
* **Izvršene provere:**
  1. **HTTP Status:** Proverava se da li API vraća status `201 Created`.
  2. **JSON Odgovor:** Proverava se da li JSON u telu HTTP odgovora sadrži polje `email` sa vrednošću `"petar@example.com"`.
  3. **Stanje u bazi:** Preko `userRepository.findByEmail("petar@example.com")` se proverava da li korisnik zaista postoji u testnoj bazi podataka.
  4. **Zaštita lozinke:** Proverava se da lozinka u bazi **nije** upisana u plain-text obliku (`"Test1234"`). Pomoću `passwordEncoder.matches` se potvrđuje da je lozinka uspešno kriptovana korišćenjem sigurnosnog enkodera.
  5. **Transakcioni integritet:** Zahvaljujući anotaciji `@Transactional`, sve izmene napravljene nad bazom podataka se automatski poništavaju na kraju testa, osiguravajući da test ne prlja bazu podataka za naredna pokretanja.
