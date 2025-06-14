
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './utils.ts';
import { TelfinRequest } from './types.ts';

import { handleGetAccessToken } from './actions/getAccessToken.ts';
import { handleGetUserInfo } from './actions/getUserInfo.ts';
import { handleGetCallHistory } from './actions/getCallHistory.ts';
import { handleGetAudioUrl } from './actions/getAudioUrl.ts';
import { handleDownloadAudioWithOauth } from './actions/downloadAudio.ts';
import { handleSaveCallHistory } from './actions/saveCallHistory.ts';
import { handleProcessCallRecord } from './actions/processCallRecord.ts';
import { handleDiagnoseApiAccess } from './actions/diagnoseApiAccess.ts';

const actionHandlers: { [key: string]: (body: TelfinRequest) => Promise<Response> } = {
  'get_access_token': handleGetAccessToken,
  'get_user_info': handleGetUserInfo,
  'get_call_history': handleGetCallHistory,
  'get_audio_url': handleGetAudioUrl,
  'download_audio_with_oauth': handleDownloadAudioWithOauth,
  'save_call_history': handleSaveCallHistory,
  'process_call_record_and_create_call': handleProcessCallRecord,
  'diagnose_api_access': handleDiagnoseApiAccess,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: TelfinRequest = await req.json();
    const { action } = body;

    console.log(`Telfin integration function invoked. Action: "${action}"`);

    const handler = actionHandlers[action];
    if (handler) {
      return await handler(body);
    } else {
      console.error(`Unknown action received: "${action}"`);
      throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in telfin-integration function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
