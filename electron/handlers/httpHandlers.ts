import axios from 'axios';
import { exec } from 'child_process';
import { ipcMain } from 'electron';

export function registerHttpHandlers(): void {
  ipcMain.handle('http-request', async (_event, { url, method, headers, body }) => {
    try {
      const response = await axios({
        url,
        method,
        headers,
        data: body,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        responseType: 'arraybuffer',
        validateStatus: () => true,
      });

      const contentType =
        (response.headers && (response.headers['content-type'] || response.headers['Content-Type'])) || '';
      const data = response.data;
      let responseBody: string;

      try {
        if (
          data instanceof ArrayBuffer ||
          (data && typeof data === 'object' && typeof (data as any).byteLength === 'number')
        ) {
          const uint8 = new Uint8Array(data as any);
          responseBody = new TextDecoder().decode(uint8);

          if (contentType.includes('application/json')) {
            try {
              responseBody = JSON.stringify(JSON.parse(responseBody), null, 2);
            } catch {
              // Keep as plain text if JSON parsing fails
            }
          }
        } else if (typeof data === 'string') {
          responseBody = data;
        } else {
          responseBody = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
        }
      } catch {
        try {
          responseBody = String(data);
        } catch {
          responseBody = '[unprintable response]';
        }
      }

      return {
        status: `${response.status} ${response.statusText}`,
        headers: response.headers,
        body: responseBody,
      };
    } catch (error) {
      if (error.code === 'EPIPE') {
        return {
          status: '413 Payload Too Large (EPIPE)',
          headers: {},
          body: '',
        };
      }
      return { status: 'Error', headers: {}, body: String(error) };
    }
  });

  ipcMain.handle('ping-host', async (_, host: string) => {
    return new Promise<number>((resolve, reject) => {
      const platform = process.platform;
      const cmd = platform === 'win32' ? `ping -n 1 ${host}` : `ping -c 1 ${host}`;
      const start = Date.now();

      exec(cmd, (error) => {
        if (error) return reject(error);

        const time = Date.now() - start;
        resolve(time);
      });
    });
  });
}
