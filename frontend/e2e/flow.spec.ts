import { test, expect } from '@playwright/test';

test.describe('ApexParts Auto Parts Store E2E Tests', () => {

  test('Complete Client Flow (Register -> Filter -> Add to Cart -> Checkout -> Check History)', async ({ page }) => {
    const randomSuffix = Math.floor(Math.random() * 10000);
    const username = `e2e_user_${randomSuffix}`;
    const email = `e2e_email_${randomSuffix}@example.com`;
    const phone = `069${randomSuffix}`;
    const password = 'password123';

    // 1. Go to Login Page
    await page.goto('/login');
    await expect(page.locator('text=APEXPARTS SECURE')).toBeVisible();

    // 2. Click "Registruj Nalog" tab switcher
    await page.locator('button:has-text("Registruj Nalog")').click();

    // 3. Fill the registration inputs
    await page.locator('input[placeholder="markom"]').fill(username);
    await page.locator('input[placeholder="marko@example.com"]').fill(email);
    await page.locator('input[placeholder="060 123 456"]').fill(phone);
    
    // Fill password in the register form (there are two forms, select the active one)
    await page.locator('form:has-text("REGISTRUJ SE I PRIJAVI") input[type="password"]').fill(password);

    // Submit registration
    await page.locator('button:has-text("REGISTRUJ SE I PRIJAVI")').click();

    // 4. Verify user is registered, logged in and redirected to home page
    await expect(page).toHaveURL('/');
    await expect(page.locator(`text=${username}`)).toBeVisible();

    // 5. Select category "Brakes"
    await page.locator('button:has-text("Brakes")').click();

    // 6. Verify "Brembo Sport Brake Disc Set (Front)" is visible and click "Dodaj"
    const bremboCard = page.locator('.group:has-text("Brembo Sport Brake Disc Set (Front)")');
    await expect(bremboCard).toBeVisible();
    await bremboCard.locator('button:has-text("Dodaj")').click();

    // 7. Click on Cart button in Header to open the cart drawer
    await page.locator('header button:has(.lucide-shopping-cart)').click();

    // 8. Verify the Brembo part is in the cart drawer and click "IDI NA PLAĆANJE"
    await expect(page.locator('.font-mono:has-text("$245.99")').first()).toBeVisible();
    await page.locator('button:has-text("IDI NA PLAĆANJE")').click();

    // 9. Verify we are on /checkout
    await expect(page).toHaveURL('/checkout');

    // 10. Fill out Shipping details
    await page.locator('input[placeholder="Marko Marković"]').fill('Dragan Nikolić');
    // Email and Phone are automatically pre-filled from user profile, but let's make sure
    await page.locator('input[placeholder="marko@example.com"]').fill(email);
    await page.locator('input[placeholder="060123456"]').fill(phone);
    await page.locator('input[placeholder="Bulevar Kralja Aleksandra 120 / Stan 5"]').fill('Njegoševa 15');
    await page.locator('input[placeholder="Beograd"]').fill('Novi Sad');
    await page.locator('input[placeholder="11000"]').fill('21000');

    // 11. Choose payment COD (Plaćanje Pouzećem)
    await page.locator('button:has-text("Plaćanje Pouzećem")').click();

    // 12. Submit the order
    await page.locator('button:has-text("POTVRDI I PORUČI")').click();

    // 13. Verify order success screen is shown
    await expect(page.locator('text=PORUDŽBINA USPEŠNO PRIMLJENA!')).toBeVisible();

    // Grab the generated Order ID
    const orderIdText = await page.locator('.text-primary.font-bold').first().innerText();
    expect(orderIdText).not.toBeNull();
    console.log(`[E2E TEST] Generated Order ID: ${orderIdText}`);

    // 14. Click "PRATI PORUDŽBINU (DASHBOARD)" to check order history
    await page.locator('a:has-text("PRATI PORUDŽBINU")').click();

    // 15. Verify we are on /dashboard and our order is listed in the history
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=MOJE PORUDŽBINE')).toBeVisible();
    
    // Check that the order ID card is rendered on the dashboard
    await expect(page.locator('.font-mono', { hasText: 'Porudžbina:' }).filter({ hasText: orderIdText }).first()).toBeVisible();
  });
});
