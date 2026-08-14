import { render } from "@testing-library/react";
import App from "./App";

test("renders loading shell", () => {
  const { container } = render(<App />);
  expect(container.querySelector(".surface")).toBeInTheDocument();
});
