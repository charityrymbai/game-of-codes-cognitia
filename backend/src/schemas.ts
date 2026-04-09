import { z } from "zod";

// Roll number regex: e.g. A12CD345
export const ROLL_NO_REGEX = /^[A-Z][0-9]{2}[A-Z]{2}[0-9]{3}$/;

// Contest ID: 4-digit string
export const CONTEST_ID_REGEX = /^[0-9]{4}$/;

export const joinContestSchema = z.object({
  contestId: z.string().regex(CONTEST_ID_REGEX, "Contest ID must be a 4-digit code"),
  rollNo: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.string().regex(ROLL_NO_REGEX, "Invalid roll number format (e.g. A12CD345)")),
});

export const saveCodeSchema = z.object({
  gameId: z.string().min(1, "gameId is required"),
  html: z.string().default(""),
  css: z.string().default(""),
  js: z.string().default(""),
});

export const createContestSchema = z.object({
  id: z.string().regex(CONTEST_ID_REGEX, "Contest ID must be a 4-digit code"),
  name: z.string().min(1, "Contest name is required"),
});

export const createGameSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  boilerplateHtml: z.string().optional().default(""),
  boilerplateCss: z.string().optional().default(""),
  boilerplateJs: z.string().optional().default(""),
});

export const updateGameBoilerplateSchema = z.object({
  boilerplateHtml: z.string().optional().default(""),
  boilerplateCss: z.string().optional().default(""),
  boilerplateJs: z.string().optional().default(""),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const systemErrorSchema = z.object({
  error: z.string(),
  context: z.string().optional(),
  stack: z.string().optional(),
});

export type JoinContestInput = z.infer<typeof joinContestSchema>;
export type SaveCodeInput = z.infer<typeof saveCodeSchema>;
export type CreateContestInput = z.infer<typeof createContestSchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameBoilerplateInput = z.infer<typeof updateGameBoilerplateSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
