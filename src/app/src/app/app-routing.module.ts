import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RepositoryOpenComponent } from './repository-open/repository-open.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { RepositoryMainComponent } from './repository-main/repository-main.component';

const routes: Routes = [
    { path: '', redirectTo: '/welcome', pathMatch: 'full' },
    { path: 'welcome', component: WelcomeComponent },
    { path: 'open', component: RepositoryOpenComponent },
    { path: 'main', component: RepositoryMainComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule { }
