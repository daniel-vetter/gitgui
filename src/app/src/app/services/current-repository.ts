import { Repository } from '../model/model';
import { Injectable } from '@angular/core';

@Injectable()
export class CurrentRepository {

    private currentRepository: Repository;

    get(): Repository {
        return this.currentRepository;
    }

    set(repository: Repository) {
        this.currentRepository = repository;
    }
}
