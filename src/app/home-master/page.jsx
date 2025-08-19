"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeMasterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.push("/home-master/login");
  }, []);
  return null;
}
