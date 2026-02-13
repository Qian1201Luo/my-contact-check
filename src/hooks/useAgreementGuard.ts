import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useAgreementGuard() {
  const [checking, setChecking] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    supabase
      .from("profiles")
      .select("agreement_signed")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (!data?.agreement_signed) {
          navigate("/agreement");
        }
        setChecking(false);
      });
  }, [user, navigate]);

  return { checking, user };
}
