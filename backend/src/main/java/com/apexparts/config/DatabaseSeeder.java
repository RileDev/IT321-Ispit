package com.apexparts.config;

import com.apexparts.model.Part;
import com.apexparts.model.PartStatus;
import com.apexparts.model.User;
import com.apexparts.repository.PartRepository;
import com.apexparts.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PartRepository partRepository;

    public DatabaseSeeder(UserRepository userRepository, PartRepository partRepository) {
        this.userRepository = userRepository;
        this.partRepository = partRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedParts();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            System.out.println("[DB SEEDER] Kreiranje podrazumevanih korisnika (Admin i Zaposleni)...");
            
            // Admin
            userRepository.save(new User("admin", "admin", "ADMIN", "admin@apexparts.com", "060-100-200"));
            
            // Employees
            userRepository.save(new User("marko", "marko", "EMPLOYEE", "marko@apexparts.com", "060-222-333"));
            userRepository.save(new User("ana", "ana", "EMPLOYEE", "ana@apexparts.com", "060-444-555"));
            
            System.out.println("[DB SEEDER] Korisnici uspešno upisani.");
        }
    }

    private void seedParts() {
        if (partRepository.count() == 0) {
            System.out.println("[DB SEEDER] Seeding initial auto parts catalog...");

            Part part1 = new Part(
                    "Brembo Sport Brake Disc Set (Front)",
                    "BRM-99120",
                    "Drilled and slotted high-carbon front brake discs offering superior heat dissipation and wet-weather stopping power.",
                    245.99,
                    "Brembo",
                    "Brakes",
                    PartStatus.IN_STOCK,
                    15,
                    List.of("BMW 3 Series 2018", "BMW 3 Series 2019", "Audi A4 2017", "Audi A4 2018", "Universal")
            );

            Part part2 = new Part(
                    "Bosch Double Platinum Spark Plug",
                    "BOS-02422",
                    "Laser welded platinum inlay on ground electrode provides 3x longer service life compared to standard copper plugs.",
                    11.49,
                    "Bosch",
                    "Engine",
                    PartStatus.IN_STOCK,
                    20,
                    List.of("BMW 3 Series 2018", "Volkswagen Golf 2015", "Volkswagen Golf 2016", "Audi A4 2017", "Universal")
            );

            Part part3 = new Part(
                    "Bilstein B8 Performance Shock Absorber",
                    "BIL-24185",
                    "Gas-pressure sport shock absorber designed specifically to be paired with lowering springs for aggressive handling.",
                    189.50,
                    "Bilstein",
                    "Suspension",
                    PartStatus.OUT_OF_STOCK,
                    0,
                    List.of("BMW 3 Series 2018", "Volkswagen Golf 2015", "BMW 3 Series 2019")
            );

            Part part4 = new Part(
                    "K&N Cold Air Intake System",
                    "KNN-63102",
                    "High-flow intake system engineered to increase horsepower and torque by providing a less restrictive air path.",
                    320.00,
                    "K&N",
                    "Engine",
                    PartStatus.IN_STOCK,
                    5,
                    List.of("BMW 3 Series 2018", "Audi A4 2017", "BMW 3 Series 2019")
            );

            Part part5 = new Part(
                    "Akrapovič Evolution Titanium Slip-On Exhaust",
                    "AKR-EVO44",
                    "Ultra-lightweight titanium exhaust system with dual carbon-fiber tailpipes. Delivers an aggressive, resonant tone.",
                    1499.99,
                    "Akrapovič",
                    "Exhaust",
                    PartStatus.OUT_OF_STOCK,
                    0,
                    List.of("BMW 3 Series 2018", "BMW 3 Series 2019")
            );

            Part part6 = new Part(
                    "Castrol EDGE 5W-30 Full Synthetic Motor Oil (5L)",
                    "CAS-5W30",
                    "Premium liquid titanium formula providing maximum engine protection under extreme high-pressure operations.",
                    49.99,
                    "Castrol",
                    "Fluids",
                    PartStatus.IN_STOCK,
                    50,
                    List.of("Universal")
            );

            Part part7 = new Part(
                    "Gates Racing Timing Belt Kit",
                    "GAT-85112",
                    "Heavy duty timing belt reinforced with aramid fibers to withstand high-revving performance conditions.",
                    95.00,
                    "Gates",
                    "Engine",
                    PartStatus.IN_STOCK,
                    12,
                    List.of("Volkswagen Golf 2015", "Volkswagen Golf 2016", "Audi A4 2017")
            );

            Part part8 = new Part(
                    "Denso Premium Cabin Carbon Air Filter",
                    "DEN-18012",
                    "Activated charcoal filter that traps dust, pollen, exhaust emissions, and neutralizes cabin odors.",
                    19.99,
                    "Denso",
                    "Filters",
                    PartStatus.OUT_OF_STOCK,
                    0,
                    List.of("BMW 3 Series 2018", "Volkswagen Golf 2015", "Audi A4 2017", "Universal")
            );

            partRepository.saveAll(List.of(part1, part2, part3, part4, part5, part6, part7, part8));
            System.out.println("[DB SEEDER] Auto parts catalog successfully seeded.");
        }
    }
}
