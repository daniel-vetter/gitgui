import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { RepositoryComponent } from "./routes/repository/repository.component";

const routes: Routes = [
    { path: "", redirectTo: "/repository", pathMatch: "full" },
    { path: "repository", component: RepositoryComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule { }
