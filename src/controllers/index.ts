import axios from "axios";
import React from "react";

export async function sendMessage(baseUrl: string, flowId: string, message: string, input_type: string, output_type: string, sessionId: React.MutableRefObject<string>, output_component?: string, tweaks?: Object, api_key?: string, additional_headers?: {[key:string]:string}) {
    let data:any = {input_type,input_value:message,output_type}
    if (tweaks) data["tweaks"]= tweaks;
    if(output_component) data["output_component"]=output_component;
    let headers:{[key:string]:string}= {"Content-Type": "application/json"}
    if(api_key) headers["x-api-key"]=api_key;
    if (additional_headers) headers = Object.assign(headers, additional_headers);
    if(sessionId.current && sessionId.current!==""){
        data.session_id=sessionId.current;
    }
    let response = axios.post(`${baseUrl}/api/v1/run/${flowId}`, data,{headers});
    return response;
}

export async function sendMessageStream(
    baseUrl: string, 
    flowId: string, 
    message: string, 
    input_type: string, 
    output_type: string, 
    sessionId: React.MutableRefObject<string>, 
    onChunk: (chunk: string) => void,
    output_component?: string, 
    tweaks?: Object, 
    api_key?: string, 
    additional_headers?: {[key:string]:string}
) {
    let data: any = {input_type, input_value: message, output_type};
    if (tweaks) data["tweaks"] = tweaks;
    if (output_component) data["output_component"] = output_component;
    if (sessionId.current && sessionId.current !== "") {
        data.session_id = sessionId.current;
    }

    let headers: {[key:string]:string} = {"Content-Type": "application/json"};
    if (api_key) headers["x-api-key"] = api_key;
    if (additional_headers) headers = Object.assign(headers, additional_headers);

    try {
        const response = await fetch(`${baseUrl}/api/v1/run/${flowId}?stream=true`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullMessage = '';
        let newSessionId = '';

        if (!reader) {
            throw new Error('Response body is not readable');
        }

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    
                    try {
                        const parsed = JSON.parse(line);
                        console.log('Parsed streaming data:', parsed);
                        
                        if (parsed.event === 'token' && parsed.data && parsed.data.chunk !== undefined) {
                            // Process all chunks, including empty ones for proper spacing
                            console.log('Token chunk received:', JSON.stringify(parsed.data.chunk));
                            fullMessage += parsed.data.chunk;
                            onChunk(parsed.data.chunk);
                        } else if (parsed.event === 'add_message' && parsed.data && parsed.data.session_id) {
                            console.log('Session ID received:', parsed.data.session_id);
                            newSessionId = parsed.data.session_id;
                        }
                    } catch (parseError) {
                        console.warn('Failed to parse streaming data:', line, parseError);
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        // Update session_id if we got a new one
        if (newSessionId) {
            sessionId.current = newSessionId;
        }

        return {
            data: {
                message: fullMessage,
                session_id: newSessionId || sessionId.current
            }
        };

    } catch (error) {
        console.error('Streaming request failed:', error);
        throw error;
    }
}