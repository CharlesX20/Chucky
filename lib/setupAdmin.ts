"use server";

import { db } from "@/firebase/admin";

export async function setupAdminUser(userId: string) {
  try {
    await db.collection("users").doc(userId).update({
      role: 'admin',
      updatedAt: new Date().toISOString()
    });
    
    return { success: true, message: "User promoted to admin successfully" };
  } catch (error) {
    console.error("Error setting up admin:", error);
    return { success: false, error: "Failed to setup admin user" };
  }
}