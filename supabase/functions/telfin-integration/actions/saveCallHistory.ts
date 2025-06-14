
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../utils.ts';
import { TelfinRequest } from '../types.ts';

export async function handleSaveCallHistory(body: TelfinRequest): Promise<Response> {
  console.log('Executing action: save_call_history');
  const { calls, orgId } = body;
  if (!calls || !orgId) {
    throw new Error('calls and orgId are required for save_call_history action');
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const callsToUpsert = calls.map(call => ({
    call_id: call.id,
    org_id: orgId,
    extension_id: call.extension_id,
    caller_number: call.caller_id_number,
    called_number: call.called_did_number,
    start_time: call.start_time ? new Date(call.start_time * 1000).toISOString() : null,
    end_time: call.end_time ? new Date(call.end_time * 1000).toISOString() : null,
    duration: call.duration,
    has_record: call.has_record,
    record_url: call.record_uuid,
    status: call.disposition,
    raw_payload: call,
    processing_status: 'pending',
  }));

  const { error } = await supabaseAdmin
    .from('telfin_calls')
    .upsert(callsToUpsert, { onConflict: 'call_id', ignoreDuplicates: false });

  if (error) {
    console.error('Error upserting telfin calls:', error);
    throw error;
  }

  return new Response(JSON.stringify({ success: true, saved_count: callsToUpsert.length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
