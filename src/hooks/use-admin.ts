import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      // Check admin (has_role returns true for super_admin too)
      const { data: adminData } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      setIsAdmin(!!adminData);

      // Check super_admin specifically
      const { data: superData } = await supabase.rpc("is_super_admin", {
        _user_id: user.id,
      });

      setIsSuperAdmin(!!superData);
      setLoading(false);
    };

    checkAdmin();
  }, [user]);

  return { isAdmin, isSuperAdmin, loading };
};
