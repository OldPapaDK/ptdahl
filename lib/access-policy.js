export const privateHeaders={'Cache-Control':'no-store','Vary':'Cookie'};
export const accessFail=(error,status=400)=>Response.json({error},{status,headers:privateHeaders});
export async function accessible(sql,user,id){
 const rows=await sql`SELECT a.id,a.snapshot,CASE WHEN p.data->>'snapshot_id'=a.snapshot->>'snapshot_id' THEN p.data->'entries' ELSE '{}'::jsonb END AS progress,p.revision FROM ptdahl.program_access a JOIN ptdahl.workspaces w ON w.owner_user_id=a.owner_user_id LEFT JOIN ptdahl.client_progress p ON p.access_id=a.id WHERE a.id::text=${id} AND a.accepted_user_id=${user.id} AND a.email=${user.email.toLowerCase()} AND EXISTS (SELECT 1 FROM jsonb_array_elements(w.data->'programs') x WHERE x->>'id'=a.program_id)`;
 return rows[0];
}
