import { useState } from "react"
import RegisterForm from "../components/RegisterForm"
import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"

const RegisterFormTestWrapper = ({
    onSubmit, registrationSuccess = false
}) => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')

    return (
        <div>
            {registrationSuccess && <div>Registracija je uspešna</div>}

            <RegisterForm
                handleClientRegister={onSubmit}
                username={username}
                setUsername={setUsername}
                email={email}
                setEmail={setEmail}
                phone={phone}
                setPhone={setPhone}
                password={password}
                setPassword={setPassword}
            />
        </div>
    );
}

describe("RegisterForm testovi", () => {
    it("uspesno popunjava obavezna polja, klikce na dugme i prikazuje poruku o uspehu", async () => {
        const mockSubmit = vi.fn((e) => e.preventDefault());

        const { rerender } = render(<RegisterFormTestWrapper onSubmit={mockSubmit} registrationSuccess={false} />);

        const usernameInput = screen.getByPlaceholderText('markom');
        const emailInput = screen.getByPlaceholderText('marko@example.com');
        const phoneInput = screen.getByPlaceholderText('060 123 456');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const submitButton = screen.getByRole('button', { name: /REGISTRUJ SE I PRIJAVI/i });

        fireEvent.change(usernameInput, { target: { value: 'Petar' } });
        fireEvent.change(emailInput, { target: { value: 'petar@example.com' } });
        fireEvent.change(phoneInput, { target: { value: '061111222' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.click(submitButton);

        expect(mockSubmit).toHaveBeenCalledTimes(1)

        rerender(<RegisterFormTestWrapper onSubmit={mockSubmit} registrationSuccess={true} />)

        const successMsg = screen.getByText('Registracija je uspešna');
        expect(successMsg).toBeInTheDocument();
    });


    it("ne dozvoljava slanje forme ako email nije unet", () => {
        const mockSubmit = vi.fn((e) => e.preventDefault());
        render(
            <RegisterFormTestWrapper
                onSubmit={mockSubmit}
                registrationSuccess={false} />
        )


        const usernameInput = screen.getByPlaceholderText('markom');
        const phoneInput = screen.getByPlaceholderText('060 123 456');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const submitButton = screen.getByRole('button', { name: /REGISTRUJ SE I PRIJAVI/i });

        fireEvent.change(usernameInput, { target: { value: 'Petar' } });
        fireEvent.change(phoneInput, { target: { value: '061111222' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.click(submitButton);

        expect(mockSubmit).not.toHaveBeenCalled();
    });
})
