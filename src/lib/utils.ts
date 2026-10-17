export type ClassDictionary = Record<string, boolean | number | string | null | undefined>;
export type ClassArray = ClassValue[];
export type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | null
  | boolean
  | undefined;

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  function process(input: ClassValue) {
    if (!input) return;
    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      input.forEach(process);
    } else if (typeof input === "object") {
      for (const [key, val] of Object.entries(input)) {
        if (val) classes.push(key);
      }
    }
  }

  inputs.forEach(process);
  return classes.join(" ");
}
