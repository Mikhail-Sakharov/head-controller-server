import {Application} from './application.js';

const application = new Application();
await application.init();
application.startServer();
