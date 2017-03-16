import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { RepositoryComponent } from "./main/repository.component";

const routes: Routes = [
    { path: "", component: RepositoryComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule { }
