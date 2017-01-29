import { Injectable } from "@angular/core";

@Injectable()
export class ReusePool<TModel, TViewModel extends PoolableViewModel<TModel>> {

    public viewModels: TViewModel[] = [];
    public used: TViewModel[] = [];

    constructor(private viewModelFactory: () => TViewModel) {

    }

    giveViewModelFor(model: TModel) {
        for (let i = 0; i < this.viewModels.length; i++) {
            if (this.viewModels[i].data === model) {
                this.used.push(this.viewModels[i]);
                this.viewModels[i].clear();
                return this.viewModels[i];
            }
        }

        let viewModel = this.viewModelFactory();
        viewModel.data = model;
        this.viewModels.push(viewModel);
        this.used.push(viewModel);
        return viewModel;
    }

    markAllUnused() {
        this.used = [];
    }

    clearUp() {
        let newList: TViewModel[] = [];
        for (let viewModel of this.viewModels) {
            if (this.used.indexOf(viewModel) !== -1)
                newList.push(viewModel);
        }
        this.viewModels = newList;
    }
}

class Container<TModel, TViewModel extends PoolableViewModel<TModel>> {
    used: boolean;
    viewModel: TViewModel;
}

export interface PoolableViewModel<TModel> {
    data: TModel;
    clear();
}
