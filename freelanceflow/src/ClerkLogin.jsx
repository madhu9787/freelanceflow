import { SignIn } from "@clerk/clerk-react";

const ClerkLogin = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <SignIn routing="path" path="/clerk-login" />
    </div>
  );
};

export default ClerkLogin;
