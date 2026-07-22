import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "../../modules/auth/auth.validation";

describe("Auth Validation", () => {
  describe("registerSchema", () => {
    it("should accept valid registration data with @umu.ac.ug email", () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@umu.ac.ug",
        password: "securePass1",
        gender: "Male" as const,
        campusId: "campus-1",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept valid registration data with @stud.umu.ac.ug email", () => {
      const data = {
        firstName: "Jane",
        lastName: "Smith",
        email: "janesmith@stud.umu.ac.ug",
        password: "securePass1",
        campusId: "campus-1",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept registration without optional gender field", () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@umu.ac.ug",
        password: "securePass1",
        campusId: "campus-1",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject non-UMU email", () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "john@gmail.com",
        password: "securePass1",
        campusId: "campus-1",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject email with subdomain of umu.ac.ug that is not stud", () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "john@staff.umu.ac.ug",
        password: "securePass1",
        campusId: "campus-1",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject password shorter than 6 characters", () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@umu.ac.ug",
        password: "abc",
        campusId: "campus-1",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject first name shorter than 2 characters", () => {
      const data = {
        firstName: "J",
        lastName: "Doe",
        email: "johndoe@umu.ac.ug",
        password: "securePass1",
        campusId: "campus-1",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject last name shorter than 2 characters", () => {
      const data = {
        firstName: "John",
        lastName: "D",
        email: "johndoe@umu.ac.ug",
        password: "securePass1",
        campusId: "campus-1",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing campusId", () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@umu.ac.ug",
        password: "securePass1",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing email", () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        password: "securePass1",
        campusId: "campus-1",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing password", () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@umu.ac.ug",
        campusId: "campus-1",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid gender value", () => {
      const data = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@umu.ac.ug",
        password: "securePass1",
        gender: "Unknown",
        campusId: "campus-1",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject empty object", () => {
      const result = registerSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should accept valid login data", () => {
      const data = {
        email: "johndoe@umu.ac.ug",
        password: "securePass1",
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept any valid email format", () => {
      const data = {
        email: "user@example.com",
        password: "securePass1",
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject empty password", () => {
      const data = {
        email: "johndoe@umu.ac.ug",
        password: "",
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing password", () => {
      const data = {
        email: "johndoe@umu.ac.ug",
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid email format", () => {
      const data = {
        email: "not-an-email",
        password: "securePass1",
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing email", () => {
      const data = {
        password: "securePass1",
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject empty object", () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
