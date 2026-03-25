import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline'; // Импортируем парсер
import { WebSocket } from 'ws';

export class Application {
  private path = '';

  constructor(
    private readonly WSS = process.env.WSS
  ) {}

  public init = async () => {
    const ports = await SerialPort.list();
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

    const port = new SerialPort({ path: this.path, baudRate: 9600 });

    // Создаем парсер, который ищет символы переноса строки \r\n
    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    const socket = new WebSocket(this.WSS);

    socket.on('open', () => {
      console.log('Подключено к WebSocket серверу');

      // Слушаем события именно от парсера (сформированные строки)
      parser.on('data', (line: string) => {
        const portData = line.trim();

        if (portData) {
          console.log('Получено из порта:', portData);

          // Проверка на валидность JSON перед отправкой (опционально)
          try {
            JSON.parse(portData);
            socket.send(JSON.stringify({ portData }));
          } catch (e) {
            console.log('Невалидный JSON пропущен:', portData);
          }
        }
      });
    });

    socket.on('error', (err) => {
      console.error('Ошибка WebSocket:', err.message);
    });
  };
}
