// Handles the Google OAuth redirect.
// The backend sends the JWT as a URL param to avoid third-party cookie issues on Safari/iOS.
// This page reads the token, sets it as a cookie, then verifies the session.

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const AuthCallback = ({ onAuthSuccess }) => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      navigate("/login?error=oauth_failed", { replace: true });
      return;
    }

    // Exchange the URL token for a proper HTTP-only cookie via the backend
    // Also store in localStorage as fallback for browsers that block cross-site cookies
    axios
      .post(
        `${import.meta.env.VITE_API_URL}/api/auth/set-cookie`,
        { token },
        { withCredentials: true },
      )
      .then((res) => {
        if (res.data?.user && onAuthSuccess) {
          // store token in localStorage so verify works on refresh even if cookie is blocked
          localStorage.setItem("hv_token_fallback", token);
          onAuthSuccess(res.data.user);
        }
        navigate("/", { replace: true });
      })
      .catch(() => {
        navigate("/login?error=oauth_failed", { replace: true });
      });
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-[#F7F6F3]">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
};

export default AuthCallback;
