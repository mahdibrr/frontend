import { SignIn } from "@clerk/nextjs";

export default function SSOCallback() {
  return <SignIn path="/sso-callback" routing="path" />;
}
