import { Injectable } from "@angular/core";

@Injectable()
export class ReusePool<TModel, TViewModel extends PoolableViewModel<TModel>> {

    public viewModels: TViewModel[] = [];

    constructor(private viewModelFactory: () => TViewModel) {

    }

    giveViewModelFor(model: TModel) {
        for (let i = 0; i < this.viewModels.length; i++) {
            if (this.viewModels[i].data === model) {
                this.viewModels[i].visible = true;
                this.viewModels[i].clear();
                return this.viewModels[i];
            }
        }

        for (let i = 0; i < this.viewModels.length; i++) {
            if (this.viewModels[i].visible === false) {
                this.viewModels[i].data = model;
                this.viewModels[i].visible = true;
                this.viewModels[i].clear();
                return this.viewModels[i];
            }
        }

        let viewModel = this.viewModelFactory();
        viewModel.data = model;
        viewModel.visible = true;
        this.viewModels.push(viewModel);
        return viewModel;
    }

    makeAllInvisible() {
        this.viewModels.forEach(x => x.visible = false);
    }
}

export interface PoolableViewModel<TModel> {
    data: TModel;
    visible: boolean;
    clear();
}
