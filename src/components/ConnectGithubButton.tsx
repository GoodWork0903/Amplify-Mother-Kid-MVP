"use client";
// components/ConnectGithubButton.tsx
import { useRouter } from "next/navigation";

export default function ConnectGithubButton() {
  const router = useRouter();

  const handleClick = () => {
    // Redirect user to your backend login endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github/login`;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
    >
      Connect GitHub
    </button>
  );
}
