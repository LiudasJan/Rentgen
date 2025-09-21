export const datasets: Record<string, { value: any; valid: boolean }[]> = {
  email: [
    { value: "user@example.com", valid: true },
    { value: "invalid@", valid: false },
    { value: "test@domain", valid: false },
  ],
  phone: [
    { value: "+37060000000", valid: true },
    { value: "123", valid: false },
  ],
  url: [
    { value: "https://example.com", valid: true },
    { value: "notaurl", valid: false },
  ],
  string: [
    { value: "hello", valid: true },
    { value: "", valid: false },
  ],
  number: [
    { value: 42, valid: true },
    { value: "abc", valid: false },
  ],
};
