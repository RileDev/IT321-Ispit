import { describe, test, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Part } from '../store/types';
import { MemoryRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { Catalog } from '../pages/Catalog';
import { Checkout } from '../pages/Checkout';
import { useStore } from '../store/useStore';

// Mock data matching the models and API specifications
const mockParts = [
  {
    id: '1',
    name: 'Brembo Brake Disc Set',
    partNumber: 'BRM-101',
    description: 'High performance brake discs',
    price: 150,
    manufacturer: 'Brembo',
    category: 'Brakes',
    status: 'IN_STOCK',
    compatibility: ['BMW 3 Series 2018', 'Universal']
  },
  {
    id: '2',
    name: 'Bosch Spark Plug',
    partNumber: 'BSH-202',
    description: 'Double iridium spark plug',
    price: 15,
    manufacturer: 'Bosch',
    category: 'Engine',
    status: 'OUT_OF_STOCK',
    compatibility: ['BMW 3 Series 2018']
  },
  {
    id: '3',
    name: 'Castrol 5W-30 Oil',
    partNumber: 'CAS-303',
    description: 'Synthetic engine oil',
    price: 45,
    manufacturer: 'Castrol',
    category: 'Fluids',
    status: 'IN_STOCK',
    compatibility: ['Universal']
  }
];

// MSW HTTP mock handlers
const handlers = [
  http.get('http://localhost:8080/api/parts', () => {
    return HttpResponse.json(mockParts);
  }),
  http.post('http://localhost:8080/api/orders', async ({ request }) => {
    const body: any = await request.json();
    return HttpResponse.json({
      id: 123,
      clientName: body.clientName || 'Gost',
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      totalPrice: body.totalPrice || 150,
      status: 'CREATED',
      createdAt: '2026-06-25T18:00:00Z',
      items: body.items || []
    }, { status: 201 });
  })
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  // Clear/Reset Zustand store states
  const store = useStore.getState();
  store.clearCart();
  store.setActiveVehicle(null);
});
afterAll(() => server.close());

describe('React Frontend - Auto Parts Store Testing Suite', () => {

  // SCENARIO 1: Prikaz svih artikala nakon uspešnog učitavanja
  test('renders all parts after successful loading from API', async () => {
    render(
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>
    );

    // Wait for the components to load from API
    await waitFor(() => {
      expect(screen.getByText('Brembo Brake Disc Set')).toBeInTheDocument();
      expect(screen.getByText('Bosch Spark Plug')).toBeInTheDocument();
      expect(screen.getByText('Castrol 5W-30 Oil')).toBeInTheDocument();
    });
  });

  // SCENARIO 2: Filtriranje artikala prema proizvođaču vozila, modelu ili kategoriji dela
  test('filters parts according to category and search query', async () => {
    render(
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Brembo Brake Disc Set')).toBeInTheDocument());

    // Click Category "Engine" filter button
    const engineFilterBtn = screen.getByRole('button', { name: 'Engine' });
    fireEvent.click(engineFilterBtn);

    // Verify only the Engine part (Spark Plug) is visible, others are not
    expect(screen.getByText('Bosch Spark Plug')).toBeInTheDocument();
    expect(screen.queryByText('Brembo Brake Disc Set')).not.toBeInTheDocument();
    expect(screen.queryByText('Castrol 5W-30 Oil')).not.toBeInTheDocument();

    // Reset Category and search
    const allFilterBtn = screen.getByRole('button', { name: 'Sve Kategorije' });
    fireEvent.click(allFilterBtn);

    // Use search query input for "Castrol"
    const searchInput = screen.getByPlaceholderText('Naziv, šifra, brend...');
    fireEvent.change(searchInput, { target: { value: 'Castrol' } });

    expect(screen.getByText('Castrol 5W-30 Oil')).toBeInTheDocument();
    expect(screen.queryByText('Brembo Brake Disc Set')).not.toBeInTheDocument();
  });

  // SCENARIO 3: Dodavanje dostupnog artikla u korpu
  test('adds available in-stock part to cart', async () => {
    render(
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Brembo Brake Disc Set')).toBeInTheDocument());

    // Verify initial store cart state is empty
    expect(useStore.getState().cart).toHaveLength(0);

    // Find the "Dodaj" button for Brembo Brake Disc Set
    const addBtns = screen.getAllByRole('button', { name: /Dodaj/i });
    // Brembo is the first one
    fireEvent.click(addBtns[0]);

    // Verify item is added to state
    const currentCart = useStore.getState().cart;
    expect(currentCart).toHaveLength(1);
    expect(currentCart[0].part.name).toBe('Brembo Brake Disc Set');
    expect(currentCart[0].quantity).toBe(1);
  });

  // SCENARIO 4: Onemogućavanje dugmeta „Dodaj u korpu“ kada artikal nije na stanju
  test('does not show "Add to Cart" button when item is OUT_OF_STOCK', async () => {
    render(
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Bosch Spark Plug')).toBeInTheDocument());

    // The spark plug is OUT_OF_STOCK.
    // Check that we DO NOT render a "Dodaj" button inside its container.
    // We should only see "Obavesti me" for this product card.
    const productCard = screen.getByText('Bosch Spark Plug').closest('.group');
    expect(productCard).toBeInTheDocument();

    const addToCartButtonInCard = productCard?.querySelector('button');
    expect(addToCartButtonInCard).toHaveTextContent(/Obavesti me/i);
    expect(addToCartButtonInCard).not.toHaveTextContent(/Dodaj/i);
  });

  // SCENARIO 5: Prikaz opcije „Obavesti me“ za artikal koji nije dostupan
  test('renders "Notify Me" option and opens contact modal for out-of-stock part', async () => {
    render(
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Bosch Spark Plug')).toBeInTheDocument());

    const notifyBtn = screen.getByRole('button', { name: /Obavesti me/i });
    expect(notifyBtn).toBeInTheDocument();

    // Click notify button
    fireEvent.click(notifyBtn);

    // Verify modal is displayed
    expect(screen.getByText('OBRAZAC OBAVEŠTENJA')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('marko@example.com')).toBeInTheDocument();
  });

  // SCENARIO 6: Prikaz poruke o grešci kada Spring Boot API nije dostupan
  test('displays connection error message when Spring Boot API is down', async () => {
    // Override the get parts handler to return a 500 server error
    server.use(
      http.get('http://localhost:8080/api/parts', () => {
        return HttpResponse.error();
      })
    );

    render(
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>
    );

    // Verify error banner is shown in the DOM
    await waitFor(() => {
      expect(screen.getByTestId('error-container')).toBeInTheDocument();
      expect(screen.getByText(/Spring Boot API nije dostupan/i)).toBeInTheDocument();
    });
  });

  // SCENARIO 7: Uspešno slanje porudžbine backend aplikaciji
  test('successfully submits order to backend via API call', async () => {
    // Setup: Populate cart with Brembo Brake Disc
    const testPart = mockParts[0];
    useStore.getState().addToCart(testPart as Part, 1);

    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    );

    // Fill checkout form fields
    fireEvent.change(screen.getByPlaceholderText('Marko Marković'), { target: { value: 'Dragan Nikolić' } });
    fireEvent.change(screen.getByPlaceholderText('marko@example.com'), { target: { value: 'dragan@mail.com' } });
    fireEvent.change(screen.getByPlaceholderText('060123456'), { target: { value: '065999888' } });
    fireEvent.change(screen.getByPlaceholderText('Bulevar Kralja Aleksandra 120 / Stan 5'), { target: { value: 'Njegoševa 15' } });
    fireEvent.change(screen.getByPlaceholderText('Beograd'), { target: { value: 'Novi Sad' } });
    fireEvent.change(screen.getByPlaceholderText('11000'), { target: { value: '21000' } });

    // Choose payment cash on delivery (COD)
    const codPaymentBtn = screen.getByRole('button', { name: /Plaćanje Pouzećem/i });
    fireEvent.click(codPaymentBtn);

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /POTVRDI I PORUČI/i });
    fireEvent.click(submitBtn);

    // Verify checkout success screen renders with mock order ID 123 from API response
    await waitFor(() => {
      expect(screen.getByText('PORUDŽBINA USPEŠNO PRIMLJENA!')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
      expect(screen.getByText('dragan@mail.com')).toBeInTheDocument();
    });

    // Verify cart was cleared after successful order
    expect(useStore.getState().cart).toHaveLength(0);
  });
});
