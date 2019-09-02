import { Component, OnInit, Inject } from '@angular/core';
import { Web3Service } from '../../util/web3.service';
import { Subscription } from 'rxjs';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-connectbtn',
  templateUrl: './connectbtn.component.html',
  styleUrls: ['./connectbtn.component.sass']
})
export class ConnectbtnComponent implements OnInit {
  public btnStatus = "btn-primary"
  public btntext = "Connect"
  contractAddress: String[]
  walletAddress: String
  constructor(public dialog: MatDialog, public web3: Web3Service) {
    this.walletAddress = this.web3.accounts
    web3.accountsObservable.subscribe(value => {
      this.dialog.closeAll()
      web3.connectToWallet(value[0]).then(address => {
        this.contractAddress = address
        console.log(this.contractAddress)
        this.connect(this.contractAddress)
      });
    });
  }
  ngOnInit() {
    this.web3.bootstrapWeb3()
  }

  btnConnect() {
    // console.log(this.walletAddress , this.contractAddress)
    if (this.walletAddress || this.contractAddress) {
      this.connect(this.contractAddress)
    } else {
      let data = {
        title: "No Ethereum Address Detected!",
        msg: "You need to login or allow access to your current ethereum address in your web3 ethereum client like Metamask (& reload)."
      }
      this.btnStatus = "btn-warning"
      this.btntext = "Connect"
      this.openAlert(data)
    }
  }

  connect(address) {
    let account = address
    if (address == "0x0000000000000000000000000000000000000000") {
      this.btnStatus = "btn-danger"
      this.btntext = "Connect"
      let data = {
        title: "InstaDApp Account is not created yet!",
        msg: "Visit Main Portal for Creating New Acount.",
        link: "Go To"
      }
      this.openAlert(data)
    } else {
      this.btnStatus = "btn-success"
      this.btntext = "Connected"
    }
  }

  openAlert(data) {
    const dialogRef = this.dialog.open(ConnectDialog, {
      width: '400px',
      data: data
    }, );
  }

}

//alert Modal
@Component({
  selector: 'connect-dialog',
  templateUrl: 'connectDialogBox.html',
})
export class ConnectDialog {
  constructor(
    public dialogRef: MatDialogRef<ConnectDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any, public web3: Web3Service) {
    // console.log(this.data);
  }



}
