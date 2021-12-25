import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { TeamsComponent } from './pages/teams/teams.component';
import { RoundsComponent } from './pages/rounds/rounds.component';
import { Top9Component } from './pages/top9/top9.component';
import { DeskPointsComponent } from './components/desk-points/desk-points.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { QuestionComponent } from './components/question/question.component';

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>  new TranslateHttpLoader(http, './assets/i18n/', '.json');

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    TeamsComponent,
    RoundsComponent,
    Top9Component,
    DeskPointsComponent,
    SettingsComponent,
    CheckboxComponent,
    QuestionComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
