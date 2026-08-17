import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the authentication screen when there is no session", async () => {
  render(<App />);

  expect(await screen.findByRole("heading", { name: "Entrar na sua conta" })).toBeInTheDocument();
});
