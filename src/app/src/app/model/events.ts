export class AppEvent {}

export interface AppEvents {
    "CurrentRepositoryChanged": AppEvent;
    "OpenRepositoryStarted": AppEvent;
    "OpenRepositoryEnded": AppEvent;
}
