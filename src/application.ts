import {SerialPort} from 'serialport';
import {WebSocket} from 'ws';

export class Application {
  private path = '';

  constructor(
    private readonly WSS = process.env.WSS
  ) {}

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
    if (!this.path) {
      console.log('Порт не инициализирован');
      return;
    }
    if (!this.WSS) {
      console.log('Не указан webSocket сервер');
      return;
    }

    const port = new SerialPort({path: this.path, baudRate: 9600});
    const socket = new WebSocket(this.WSS);

    socket.onopen = () => {
      port.on('data', async (data) => {
        const portData = data.toString('utf8');

        console.log(JSON.stringify({portData}));

        socket.send(JSON.stringify({portData}));
      });
    };
  };
}
