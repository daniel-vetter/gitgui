import { ProcessStartRequestHandler } from "./process-start-request-handler";
import { FsExtra } from "./fs-extra-handler";

export class Bootstrapper {
    bootstrap() {
        new ProcessStartRequestHandler().setup();
        new FsExtra().setup();
    }
}



