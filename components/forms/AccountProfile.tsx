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

// Only the fields the user can legitimately set.
// role is intentionally absent — it is server-controlled.
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().optional(),
});

interface AccountProfileProps {
  user: {
    id: string;
    email: string;
    name: string;
    address?: string | null;
  };
  btnTitle: string;
}

export function AccountProfile({ user, btnTitle }: AccountProfileProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      address: user.address || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      // Only send the fields the user controls.
      // email is read from Clerk on the server.
      // role is always set server-side to CUSTOMER.
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          address: values.address,
        }),
      });

      if (response.ok) {
        router.push("/");
      } else {
        const error = await response.json().catch(() => ({}));
        console.error("Failed to update user:", error);
        form.setError("root", {
          message: error?.error || "Failed to create account. Please try again.",
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
        {/* Email is display-only — sourced from Clerk, not editable here */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <p className="px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm border border-gray-200 dark:border-gray-700">
            {user.email}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Email is managed through your account settings
          </p>
        </div>

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