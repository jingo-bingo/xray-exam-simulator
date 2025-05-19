
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'

// Define type for user info
interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse filter from request (if provided)
    let filter = 'all'
    try {
      const { filter: requestFilter } = await req.json()
      if (requestFilter) {
        filter = requestFilter
      }
    } catch {
      // If request body parsing fails, use default filter
    }

    console.log(`list-users: Fetching users with filter: ${filter}`)

    // Get auth users through the service role client
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error("list-users: Error fetching auth users:", authError)
      throw authError
    }
    
    if (!authUsers?.users?.length) {
      console.warn("list-users: No users found")
      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }
    
    // Get user IDs to fetch additional data
    const userIds = authUsers.users.map(user => user.id)
    
    // Fetch profiles and roles in parallel
    const [profilesResponse, rolesResponse] = await Promise.all([
      supabase.from("profiles").select("*").in("id", userIds),
      supabase.from("user_roles").select("*").in("user_id", userIds)
    ])

    if (profilesResponse.error) {
      console.error("list-users: Error fetching profiles:", profilesResponse.error)
      throw profilesResponse.error
    }
    
    if (rolesResponse.error) {
      console.error("list-users: Error fetching roles:", rolesResponse.error)
      throw rolesResponse.error
    }
    
    // Combine the data
    let combinedUsers = authUsers.users.map(user => {
      const profile = profilesResponse.data?.find(p => p.id === user.id) || null
      const roleObj = rolesResponse.data?.find(r => r.user_id === user.id) || null
      
      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        first_name: profile?.first_name || null,
        last_name: profile?.last_name || null,
        role: roleObj?.role || null
      } as UserWithRole
    })
    
    // Apply filter if needed
    if (filter !== "all") {
      combinedUsers = combinedUsers.filter(user => user.role === filter)
    }
    
    console.log("list-users: Users fetched successfully", { count: combinedUsers.length })
    
    return new Response(JSON.stringify({ data: combinedUsers }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error) {
    console.error("list-users: Error in function:", error)
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }
})
