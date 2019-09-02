import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Web3Service } from '../../util/web3.service';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  tnxInterval;
  dialogRef
  constructor(public dialog: MatDialog, public web3: Web3Service, private httpClient: HttpClient) {

    web3.tnxHashObservable.subscribe(async (hash) => {
      this.openAlert({
        msg: `Txn Pending...`,
        msgColor: "warning",
        shortHash: this.shortHash(hash),
        hash: hash,
        status: false
      })
      let isConfirmedShowed = false;
      this.tnxInterval = setInterval(() => {
        this.web3.getTX(hash).then((result) => {
          if (!result) { return; }
          if (!result.blockNumber) { return; }
          isConfirmedShowed = true;
          this.tnxComfirmed(hash)
        })
      }, 2000)
    })
  }

  ngOnInit() {
  }

  openAlert(data) {
    this.dialogRef = this.dialog.open(TXDialog, {
      width: '350px',
      data: data
    }, );
  }

  shortHash(tx) {
    let hash = `${tx.slice(0, 5)}....${tx.slice(tx.length - 5)}`
    return hash
  }

  tnxComfirmed(hash) {
    clearInterval(this.tnxInterval)
    this.dialog.closeAll();
    this.web3.reload()
    this.openAlert({
      msg: `Txn Comfirmed.`,
      msgColor: "success",
      shortHash: this.shortHash(hash),
      hash: hash,
      status: true
    })
  }

}


//alert Modal
@Component({
  selector: 'alert-dialog',
  templateUrl: 'alertDialogBox.html',
  styleUrls: ['./dashboard.component.scss']
})
export class TXDialog {
  color = 'fffff';
  mode = 'indeterminate';
  value = 50;
  constructor(
    public dialogRef: MatDialogRef<TXDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }


}
