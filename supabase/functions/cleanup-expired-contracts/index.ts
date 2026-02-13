import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find expired contracts
    const { data: expiredContracts, error: fetchError } = await supabase
      .from("contracts")
      .select("id, file_path, status")
      .lt("expires_at", new Date().toISOString())
      .neq("status", "expired");

    if (fetchError) {
      throw new Error(`Failed to fetch expired contracts: ${fetchError.message}`);
    }

    if (!expiredContracts || expiredContracts.length === 0) {
      return new Response(JSON.stringify({ message: "No expired contracts found", deleted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let deletedCount = 0;

    for (const contract of expiredContracts) {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from("contracts")
        .remove([contract.file_path]);

      if (storageError) {
        console.error(`Failed to delete file ${contract.file_path}:`, storageError.message);
      }

      // Update contract status to expired
      const { error: updateError } = await supabase
        .from("contracts")
        .update({ status: "expired" })
        .eq("id", contract.id);

      if (updateError) {
        console.error(`Failed to update contract ${contract.id}:`, updateError.message);
      } else {
        deletedCount++;
      }
    }

    return new Response(
      JSON.stringify({ message: `Cleaned up ${deletedCount} expired contracts`, deleted: deletedCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cleanup error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
