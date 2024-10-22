import {z} from "zod";

export const UserSchema = z.object({
    name: z.string(),
});

export type User = z.infer<typeof UserSchema>;

