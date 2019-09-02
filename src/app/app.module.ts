import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';

import { AppComponent } from './app.component';

import {UtilModule} from './util/util.module';

import { ProtcolsComponent } from './layout/protcols/protcols.component';
import { DashboardComponent } from './layout/dashboard/dashboard.component';
import { TXDialog } from './layout/dashboard/dashboard.component';

import { ConnectbtnComponent } from './components/connectbtn/connectbtn.component';
import { ConnectDialog } from './components/connectbtn/connectbtn.component';

import { CompoundComponent } from './compound/compound.component';
import { SupplyDialog } from './compound/compound.component';
import { WithdrawDialog } from './compound/compound.component';
import { BorrowDialog } from './compound/compound.component';
import { PayBackDialog } from './compound/compound.component';

import { MakerDaoComponent } from './maker-dao/maker-dao.component';
import { DepositDialog } from './maker-dao/maker-dao.component';
import { DaiGenerateDialog } from './maker-dao/maker-dao.component';
import { EthWithdrawDialog } from './maker-dao/maker-dao.component';
import { DaiPaybackDialog } from './maker-dao/maker-dao.component';
import { MakerAlertDialog } from './maker-dao/maker-dao.component';

import { ExitComponent } from './exit/exit.component';

import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';


import {MaterialModule} from './material/material.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    CompoundComponent,
    SidebarComponent,
    ConnectbtnComponent,
    MakerDaoComponent,
    SupplyDialog,
    WithdrawDialog,
    BorrowDialog,
    PayBackDialog,
    DepositDialog,
    DaiGenerateDialog,
    EthWithdrawDialog,
    DaiPaybackDialog,
    MakerAlertDialog,
    TXDialog,
    ConnectDialog,
    FooterComponent,
    ExitComponent,
    ProtcolsComponent
  ],
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    UtilModule,
    RouterModule,
    AppRoutingModule,
    NgbModule,
    MaterialModule
  ],
  entryComponents: [
    SupplyDialog,
    WithdrawDialog,
    BorrowDialog,
    PayBackDialog,
    DepositDialog,
    DaiGenerateDialog,
    EthWithdrawDialog,
    DaiPaybackDialog,
    MakerAlertDialog,
    TXDialog,
    ConnectDialog
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
