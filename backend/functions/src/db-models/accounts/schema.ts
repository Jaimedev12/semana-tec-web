import {z} from "zod";

export const AccountSchema = z.object({
    userId: z.string(),
    username: z.string(),
    password: z.string(),
    name: z.string().optional(),
});

export type Account = z.infer<typeof AccountSchema>;

