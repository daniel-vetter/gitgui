import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { RepositoryOpenComponent } from './repository-open/repository-open.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { EventAggregator } from './services/event-aggregator';
import { Process } from './services/git/infrastructure/process';
import { GitRaw } from './services/git/infrastructure/git-raw';
import { GitPathProvider } from './services/git/infrastructure/git-executable-provider';
import { StatusReader } from './services/git/infrastructure/status-reader';
import { CommitsReader } from './services/git/commits-reader';
import { RepositoryReader } from './services/git/repository-reader';

@NgModule({
  declarations: [
    AppComponent,
    RepositoryOpenComponent,
    WelcomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
      EventAggregator,
      Process,
      GitRaw,
      GitPathProvider,
      StatusReader,
      CommitsReader,
      RepositoryReader
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
