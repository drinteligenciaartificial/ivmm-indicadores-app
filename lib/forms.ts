export function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export function optionalValue(formData: FormData, name: string) {
  const input = value(formData, name);
  return input ? input : null;
}

export function numberValue(formData: FormData, name: string) {
  const input = Number(value(formData, name));
  return Number.isFinite(input) ? input : 0;
}

export function optionalNumber(formData: FormData, name: string) {
  const input = value(formData, name);
  if (!input) return null;
  const number = Number(input);
  return Number.isFinite(number) ? number : null;
}

export function booleanValue(formData: FormData, name: string) {
  return formData.get(name) === "on";
}
