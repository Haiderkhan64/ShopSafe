"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Form schema matching Prisma User model
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().optional(),
  role: z.enum(["ADMIN", "ANALYST", "CUSTOMER"]),
});

interface AccountProfileProps {
  user: {
    id: string;
    email: string;
    name: string;
    address?: string | null;
    role?: "ADMIN" | "ANALYST" | "CUSTOMER";
  };
  btnTitle: string;
}

export function AccountProfile({ user, btnTitle }: AccountProfileProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user.email || "",
      name: user.name || "",
      address: user.address || "",
      role: user.role || "CUSTOMER",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          email: values.email,
          name: values.name,
          address: values.address,
          role: values.role,
        }),
      });

      if (response.ok) {
        router.push("/");
      } else {
        const error = await response.json();
        console.error("Failed to update user:", error);
        form.setError("root", {
          message: "Failed to create account. Please try again.",
        });
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      form.setError("root", {
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="youremail@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Muhammad Umar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipping Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="123 Main St, City, State, Zip Code"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This will be used for order deliveries
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : btnTitle}
        </Button>
      </form>
    </Form>
  );
}

export default AccountProfile;