import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const GUEST_COOKIE = "guest_user_id";

export async function getOrCreateGuestUser() {
  const cookieStore = await cookies();
  let guestId = cookieStore.get(GUEST_COOKIE)?.value;

  if (guestId) {
    // Try to find the guest user
    let user = await prisma.user.findUnique({ where: { id: guestId } });
    if (user) return user;
  }

  // Create a new guest user
  const newGuest = await prisma.user.create({
    data: {
      name: "Guest",
      email: null,
      image: null,
      avatar: null,
    },
  });

  // Set the guest user ID in cookies
  await cookieStore.set(GUEST_COOKIE, newGuest.id, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return newGuest;
}
