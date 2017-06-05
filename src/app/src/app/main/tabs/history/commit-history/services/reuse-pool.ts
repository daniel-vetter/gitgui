export class ReusePool<TModel, TViewModel extends PoolableViewModel<TModel>> {

    public viewModels: TViewModel[] = [];
    private debugTitle: string = undefined;

    constructor(private viewModelFactory: () => TViewModel) {}

    giveViewModelFor(model: TModel) {
        if (!model)
            throw Error("no model provided");

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

        const viewModel = this.viewModelFactory();
        viewModel.data = model;
        viewModel.visible = true;
        this.viewModels.push(viewModel);
        return viewModel;
    }

    makeAllInvisible() {
        this.viewModels.forEach(x => x.visible = false);
    }

    remap(models: TModel[], map: (from: TModel, to: TViewModel) => boolean) {
        this.remapRange(models, 0, models.length, map);
    }

    remapRange(models: TModel[], startIndex: number, endIndex: number, map: (from: TModel, to: TViewModel) => boolean) {
        this.makeAllInvisible();
        const remaining: TModel[] = [];

        let remapCount = 0;
        let reuseCount = 0;
        let recreated = 0;

        if (startIndex < 0) startIndex = 0;
        if (endIndex > models.length) endIndex = models.length;

        // remap all models which already have a existing view model
        for (let i = startIndex; i < endIndex; i++) {
            const model = models[i];
            const viewModel = this.viewModels.find(x => x.data === model);
            if (viewModel) {
                viewModel.clear();
                viewModel.data = model;
                if (map(model, viewModel))
                    viewModel.visible = true;
                else
                    viewModel.visible = false;
                remapCount++;
            } else {
                remaining.push(model);
            }
        }

        // remap all remaining models to already existing view models
        const stillRemaining: TModel[] = [];
        for (const model of remaining) {
            const viewModel = this.viewModels.find(x => x.visible === false);
            if (viewModel) {
                viewModel.clear();
                viewModel.data = model;
                if (map(model, viewModel))
                    viewModel.visible = true;
                else
                    viewModel.visible = false;
                reuseCount++;
            } else {
                stillRemaining.push(model);
            }
        }

        // create new viewModels for each model still not mapped
        for (const model of stillRemaining) {
            const viewModel = this.viewModelFactory();
            viewModel.clear();
            if (map(model, viewModel)) {
                viewModel.visible = true;
                viewModel.data = model;
                this.viewModels.push(viewModel);
            } else {
                viewModel.visible = false;
            }
            recreated++;
        }

        if (this.debugTitle !== undefined)
            console.log("ReusePool " + this.debugTitle + " Remapping " + startIndex + "-"+ endIndex +" (Total: " + this.viewModels.length + ", Remap: "+ remapCount +", Reuse: "+reuseCount+", " + recreated + ")");
    }

    enableLogging(title: string) {
        this.debugTitle = title;
    }
}

export interface PoolableViewModel<TModel> {
    data: TModel;
    visible: boolean;
    clear();
}
