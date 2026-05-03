import { intakeFormSchema } from '../validation';

describe('intakeFormSchema', () => {
  it('validates a correct form', () => {
    const validData = {
      name: "Jane Doe",
      company: "Acme Corp",
      email: "jane@acme.com",
      department: "engineering",
      bottleneck: "We spend too much time reviewing code manually."
    };
    
    const result = intakeFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const invalidData = {
      name: "Jane Doe",
      company: "Acme Corp",
      email: "not-an-email",
      department: "engineering",
      bottleneck: "We spend too much time reviewing code manually."
    };
    
    const result = intakeFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("valid email");
    }
  });

  it('rejects short bottleneck', () => {
    const invalidData = {
      name: "Jane Doe",
      company: "Acme Corp",
      email: "jane@acme.com",
      department: "engineering",
      bottleneck: "Too slow" // < 10 chars
    };
    
    const result = intakeFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("10 chars");
    }
  });

  it('requires all fields', () => {
    const result = intakeFormSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects a one-character name', () => {
    const result = intakeFormSchema.safeParse({
      name: "J",
      company: "Acme Corp",
      email: "jane@acme.com",
      department: "engineering",
      bottleneck: "We spend too much time reviewing code manually.",
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty department', () => {
    const result = intakeFormSchema.safeParse({
      name: "Jane Doe",
      company: "Acme Corp",
      email: "jane@acme.com",
      department: "",
      bottleneck: "We spend too much time reviewing code manually.",
    });
    expect(result.success).toBe(false);
  });
});
