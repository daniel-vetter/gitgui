import { NotificationItem } from "./notifications";

export abstract class NotificationBase<TInput, TOutput> {
    public notificationItem: NotificationItem<TInput, TOutput>;
    public close(output: TOutput) {
        this.notificationItem.close(output);
    }
    abstract onInit(input: TInput): void;
}
