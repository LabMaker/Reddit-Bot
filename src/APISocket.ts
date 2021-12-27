import { API } from 'labmaker-api-wrapper/lib/utils/BaseAPI';
import { io } from 'socket.io-client';
import { Events } from '.';
interface ICallback {
  (error: Events, result?: any): void;
}

export default class APISocket {
  public socket = io(`${process.env.API_URL}/reddit`, {
    extraHeaders: {
      Authorization: API.accessToken,
    },
  });

  public listen(callback: ICallback) {
    this.socket.on('connect', () => {
      console.log('Socket Conected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket Disconnected'); // false
    });

    this.socket.on('error', (data) => {
      console.log('Error Occured');
    });

    this.socket.on('exception', (ex) => {
      switch (ex.code) {
        case 401: {
          console.log('Invalid API token provided. Disconnecting Client.');
          this.socket.disconnect();
        }
      }
    });

    this.socket.on(Events.Config, (data) => {
      callback(Events.Config, data);
    });

    this.socket.on(Events.Delete, (data) => {
      callback(Events.Delete, data);
    });
  }
}
