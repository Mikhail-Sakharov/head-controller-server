import {SerialPort} from 'serialport';
import {WebSocket} from 'ws';

export class Application {
  private path = '';

  constructor() {}

  public init = async () => {
    await SerialPort.list()
      .then((ports) => {
        const portDataItem = ports.find((portData) => {
          return !!portData.path && (
            !!portData.manufacturer ||
            !!portData.pnpId ||
            !!portData.vendorId ||
            !!portData.productId
          );
        });

        if (portDataItem && portDataItem.path) {
          this.path = portDataItem.path;
        }
      });
  };

  public startServer = () => {
    if (this.path) {
      const port = new SerialPort({path: this.path, baudRate: 9600});
      const socket = new WebSocket('ws://localhost:2305');

      socket.onopen = () => {
        port.on('data', (data) => {
          const portData = data.toString('utf8');

          console.log(portData);

          socket.send(JSON.stringify({portData}));
        });
      };
    } else {
      console.log('Порт не инициализирован');
    }
  };
}
