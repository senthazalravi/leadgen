"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (username === "admin" && password === "outrinsic") {
    const cookieStore = await cookies();
    cookieStore.set("session", "admin", {

      maxAge: 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    redirect("/dashboard");
  } else {
    return { error: "Invalid credentials" };
  }
}