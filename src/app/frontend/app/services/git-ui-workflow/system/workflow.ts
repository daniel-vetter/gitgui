import { Type, Injector, Injectable } from "@angular/core";

@Injectable()
export class Workflow {

    constructor(private injector: Injector) { }

    create<TInput, TOutput, T extends WorkflowBase<TInput, TOutput>>(c: Type<WorkflowBase<TInput, TOutput>>): WorkflowRunBuilder<TInput, TOutput> {
        return new WorkflowRunBuilder<TInput, TOutput>(x => this.onRun(c, x))
    }

    private onRun<TInput, TOutput, T extends WorkflowBase<TInput, TOutput>>
        (c: Type<WorkflowBase<TInput, TOutput>>, request: WorkflowRunRequest<TInput, TOutput>): TOutput {
        const workflowInstance = this.injector.get(c)
        const output = workflowInstance.run(request.input)
        return output;
    }
}

export interface WorkflowBase<TInput, TOutput> {
    run(input: TInput): TOutput;
}

export class WorkflowRunBuilder<TInput, TOutput> {

    private parentWorkflow: WorkflowBase<any, any> | undefined;

    constructor(private onRun: (request: WorkflowRunRequest<TInput, TOutput>) => TOutput) { }

    run(input: TInput): TOutput {
        return this.onRun({
            input: input,
            parentWorkflow: this.parentWorkflow
        });
    }

    asSubWorkflowTo(parentWorkflow: WorkflowBase<any, any>): WorkflowRunBuilder<TInput, TOutput> {
        this.parentWorkflow = parentWorkflow;
        return this;
    }
}

interface WorkflowRunRequest<TInput, TOutput> {
    input: TInput;
    parentWorkflow: WorkflowBase<any, any> | undefined;
}
