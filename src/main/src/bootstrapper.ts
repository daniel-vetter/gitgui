import { ProcessStartRequestHandler } from "./process-start-request-handler";

export class Bootstrapper {
    bootstrap() {
        new ProcessStartRequestHandler().setup();
    }
}



