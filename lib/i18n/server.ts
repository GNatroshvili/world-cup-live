import { cookies } from "next/headers";
import { getLocale, getDictionary } from "./index";

export async function getServerLocale() {
  const cookieStore = await cookies();
  return getLocale(cookieStore.get("lang")?.value);
}

export async function getServerT() {
  const locale = await getServerLocale();
  return getDictionary(locale);
}
