import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Web3Service } from '../util/web3.service';


declare let require: any;
const tokens = require('../util/common/tokens.json')
const makerABI = require('../util/common/ABI/makerABI.json')


import { environment } from '../../environments/environment'


import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-maker-dao',
  templateUrl: './maker-dao.component.html',
  styleUrls: ['./maker-dao.component.scss']
})
export class MakerDaoComponent implements OnInit {
  userStats;
  makerStats = {
    cdp: 0,
    eth: 0,
    dai: 0,
    ratio: 0,
    collateralValue: 0,
    liqValue: 0,
    debtValue: 0,
    netValue: 0,
    feePercentage: 0,
    fee: 0,
    ethPrice: 0
  };
  userBalStats = {}
  userFeeStats;
  tokenPriceConversation
  ethPrice
  CDPID = 0;
  constructor(public dialog: MatDialog, public web3: Web3Service, private httpClient: HttpClient, private _snackBar: MatSnackBar) {
    web3.contractAccountObservable.subscribe(async (address) => {
      if (address != "0x0000000000000000000000000000000000000000") {
        let stats = await this.httpClient.get<any[]>(`${environment.mkr}/lad/${address}`).toPromise();
        let priceConversationData = await this.httpClient.get<any[]>(`${environment.instanode}/stats/price`).toPromise();
        let balancesData = await this.httpClient.get<any>(`${environment.instanode}/balance/${web3.accounts[0]}`).toPromise();
        this.tokenPriceConversation = priceConversationData
        this.ethPrice = this.tokenPriceConversation.data[0].price
        this.userBalStats = balancesData.data
        this.userStats = stats[0]
        if (stats.length > 0) {
          // console.log(stats)
          let feeData = await this.httpClient.get<any>(`${environment.instanode}/maker/fee/${stats[0].id}`).toPromise();
          this.userFeeStats = feeData.data
          this.createStats(1, stats[0])
          this.CDPID = stats[0].id
        } else {
          this.createStats(2, stats)
        }

      } else {
        this.makerStats = {
          cdp: 0,
          eth: 0,
          dai: 0,
          ratio: 0,
          collateralValue: 0,
          liqValue: 0,
          debtValue: 0,
          netValue: 0,
          feePercentage: 0,
          fee: 0,
          ethPrice: 0
        };
        this.CDPID = 0
      }

    })
  }

  ngOnInit() {
  }

  openSnackBar(message: string, action: string) {
    const snackBarRef = this._snackBar.open(message, action, {
      duration: 5000,
    });
    snackBarRef.onAction().subscribe((result) => {
      console.log(action);
      if (action == "Open CDP") {
        this.deposit()
      }
    });

  }

  createStats(type, stats) {
    let tokensPrice = this.tokenPriceConversation.data
    if (type == 1) {
      // console.log(stats)
      this.makerStats = {
        cdp: stats.id,
        eth: stats.ink * Number(stats.per),
        dai: stats.art,
        ethPrice: stats.pip,
        ratio: (100 / stats.ratio) * 100,
        collateralValue: stats.tab,
        liqValue: stats.liq_price,
        debtValue: stats.art * 1,
        netValue: stats.tab - (stats.art + this.userFeeStats.fees),
        feePercentage: (this.userFeeStats.feePA) * 100,
        fee: (this.userFeeStats.fees)

      }
    } else if (type == 2) {
      // console.log(stats)
    }
    console.log(this.makerStats)
  }


  async  close() {
    if (this.CDPID == 0) {
      this.openAlert({
        title: `No CDP to close  `,
        msg: `You don't have any CDP to close..`
      })
      return
    }

    let daiPayback = this.makerStats.debtValue * (10 ** 18)
    let daiBal = this.userBalStats[1]

    if (daiPayback < daiBal) {
      this.openAlert({
        title: `Out of Balance`,
        msg: `You have no enough balance to close CDP.`
      })
      return
    }

    let allowedAmt = await this.web3.getAllowance(tokens[1].address);
    console.log(allowedAmt)
    if (allowedAmt < daiPayback) {
      console.error("NOT ALLOWED")
      this.web3.setAllowance(tokens[1].address)
    }

    let arg = [this.CDPID];
    let callData = this.web3.getCallData(makerABI.cdpShutLogic, arg)
    let executeData = {
      logicProxyName: "InstaMaker",
      value: 0,
    }
    this.web3.executeFunction(callData, executeData)
  }


  openAlert(data) {
    const dialogRef = this.dialog.open(MakerAlertDialog, {
      width: '350px',
      data: data
    }, );
  }

  check() {
    this.web3.tnxComfirmation("0xff27770bcc53af4b20e61a1f6a10dfba5058445b55d3f1f24188bca14c49ca7d")
  }
  deposit() {
    let data = {
      ethBal: (this.userBalStats[0] / (10 ** 18)),
      eth: this.makerStats.eth,
      ethPrice: this.ethPrice,
      breakEvenPrice: this.makerStats.liqValue,
      debtValue: this.makerStats.debtValue
    }
    this.openDialog("deposit", data)
  }

  generate() {
    if (this.CDPID == 0) {
      console.log("NO CDP")
      this.openSnackBar("NO CDP FOUND!!!", "Open CDP")
      return
    }
    let data = {
      maxDrawValue: ((this.makerStats.collateralValue * 2) / 3) - this.makerStats.dai,
      ethPrice: this.ethPrice,
      breakEvenPrice: this.makerStats.liqValue

    }
    this.openDialog("generate", data)
  }

  withdraw() {
    if (this.CDPID == 0) {
      console.log("NO CDP")
      this.openSnackBar("NO CDP FOUND!!!", "Open CDP")
      return
    }
    let data = {
      maxWithDrawValue: (this.makerStats.eth) - (this.makerStats.debtValue * 3 / 2) / this.makerStats.ethPrice,
      breakEvenPrice: this.makerStats.liqValue,
      ethPrice: this.makerStats.ethPrice,
      eth: this.makerStats.eth,
      debtValue: this.makerStats.debtValue
    }
    this.openDialog("withdraw", data)
  }

  payBack() {
    if (this.CDPID == 0) {
      console.log("NO CDP")
      this.openSnackBar("NO CDP FOUND!!!", "Open CDP")
      return
    }
    let data = {
      daiBal: (this.userBalStats[1] / (10 ** 18)),
      breakEvenPrice: this.makerStats.liqValue,
      ethPrice: this.makerStats.ethPrice,
      eth: this.makerStats.eth,
      debtValue: this.makerStats.debtValue
    }
    this.openDialog("payback", data)
  }

  depositExecute(data) {
    let ethAmt = data.eth * (10 ** 18)
    console.log("ETH Amt:", ethAmt)
    console.log("CDPID", this.CDPID)
    if (this.CDPID == 0) {
      let arg = [];
      console.log(arg)
      let callData = this.web3.getCallData(makerABI.cdpLockOpenLogic, arg)
      let executeData = {
        logicProxyName: "InstaMaker",
        value: ethAmt,
      }
      this.web3.executeFunction(callData, executeData)
    } else {
      let arg = [this.CDPID];
      let callData = this.web3.getCallData(makerABI.cdpLockLogic, arg)
      let executeData = {
        logicProxyName: "InstaMaker",
        value: ethAmt,
      }
      this.web3.executeFunction(callData, executeData)
    }
  }

  withdrawExecute(data) {
    console.log(data)
    let ethAmt = data.ethFree * (10 ** 18)
    console.log("ETH Amt:", ethAmt)
    console.log("CDPID", this.CDPID)
    let arg = [this.CDPID, String(ethAmt)];
    console.log(arg)
    let callData = this.web3.getCallData(makerABI.cdpFreeLogic, arg)
    let executeData = {
      logicProxyName: "InstaMaker",
      value: 0,
    }
    this.web3.executeFunction(callData, executeData)
  }

  paybackExecute(data) {
    console.log(data)
    let daiAmt = data.daiPayback * (10 ** 18)
    console.log("DAI Amt:", daiAmt)
    console.log("CDPID", this.CDPID)
    let arg = [this.CDPID, String(daiAmt)];
    console.log(arg)
    let callData = this.web3.getCallData(makerABI.cdpWipeLogic, arg)
    let executeData = {
      logicProxyName: "InstaMaker",
      value: 0,
    }
    this.web3.executeFunction(callData, executeData)
  }

  generateExecute(data) {
    console.log(data)
    let daiAmt = data.dai * (10 ** 18)
    console.log("DAI Amt:", daiAmt)
    console.log("CDPID", this.CDPID)
    let arg = [this.CDPID, String(daiAmt)];
    console.log(arg)
    let callData = this.web3.getCallData(makerABI.cdpDrawLogic, arg)
    let executeData = {
      logicProxyName: "InstaMaker",
      value: 0,
    }
    this.web3.executeFunction(callData, executeData)
  }


  openDialog(type, tokenData): void {
    // console.log(tokenData)
    if (type == "deposit") {
      const dialogRef = this.dialog.open(DepositDialog, {
        width: '300px',
        data: tokenData
      }, );

      dialogRef.afterClosed().subscribe(result => {
        // console.log(result)
        if (result) {
          this.depositExecute(result)
        }
      });
    } else if (type == "generate") {
      const dialogRef = this.dialog.open(DaiGenerateDialog, {
        width: '300px',
        data: tokenData
      }, );

      dialogRef.afterClosed().subscribe(result => {
        // console.log(result)
        if (result) {
          this.generateExecute(result)
        }
      });
    } else if (type == "withdraw") {
      const dialogRef = this.dialog.open(EthWithdrawDialog, {
        width: '300px',
        data: tokenData
      }, );

      dialogRef.afterClosed().subscribe(result => {
        // console.log(result)
        if (result) {
          this.withdrawExecute(result)
        }
      });
    } else if (type == "payback") {
      const dialogRef = this.dialog.open(DaiPaybackDialog, {
        width: '300px',
        data: tokenData
      }, );

      dialogRef.afterClosed().subscribe(result => {
        // console.log(result)
        if (result) {
          this.paybackExecute(result)
        }
      });
    }

  }


}


//ETH DEPOSIT
@Component({
  selector: 'deposit-dialog',
  templateUrl: 'depositDialogBox.html',
})
export class DepositDialog {
  value: number
  breakEvenPrice: number
  executeData;
  btnStatus = true
  status;
  constructor(
    public dialogRef: MatDialogRef<DepositDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.breakEvenPrice = this.data.breakEvenPrice
    console.log(this.data);
    if (this.data.ethBal == 0) this.status = "NO ETH TO DEPOSIT"
  }

  calculate(event) {
    this.btnStatus = event > 0 && this.data.ethBal ? false : true
    this.value = Number(event)
    if (event > this.data.ethBal) {
      this.value = this.data.ethBal
    }
    let maxLiq_price = ((this.data.eth + this.data.value) * this.data.ethPrice) * 2 / 3
    this.breakEvenPrice = (this.data.debtValue) * this.data.ethPrice / maxLiq_price
    this.breakEvenPrice = isNaN(this.breakEvenPrice) ? 0 : this.breakEvenPrice
    this.data.value = this.value
    this.executeData = {
      eth: Number(this.value),
      breakEvenPrice: this.breakEvenPrice,
    }
  }
  onNoClick(): void {
    console.log(this.executeData)
    this.dialogRef.close(this.executeData);
  }

}


//DAI GENERATE
@Component({
  selector: 'daiGenerate-dialog',
  templateUrl: 'generateDialogBox.html',
})
export class DaiGenerateDialog {
  value: number
  breakEvenPrice: number
  executeData;
  btnStatus = true
  status;
  constructor(
    public dialogRef: MatDialogRef<DaiGenerateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(this.data);
    this.breakEvenPrice = this.data.breakEvenPrice
    if (this.data.maxDrawValue == 0) this.status = "MAX DAI IS WITHDRAWN"

  }

  calculate(event) {
    this.btnStatus = event > 0 && this.data.maxDrawValue ? false : true

    this.value = Number(event)

    if (event > this.data.maxDrawValue) {
      this.value = this.data.maxDrawValue
    }
    this.breakEvenPrice = (this.value * this.data.ethPrice) / this.data.maxDrawValue
    this.data.value = this.value
    this.executeData = {
      dai: Number(this.value),
      breakEvenPrice: this.breakEvenPrice,
    }
  }
  onNoClick(): void {
    this.data.breakEvenPrice = this.breakEvenPrice
    this.dialogRef.close(this.executeData);
  }

}


//ETH WITHDRAW
@Component({
  selector: 'ethWithdraw-dialog',
  templateUrl: 'withdrawDialogBox.html',
})
export class EthWithdrawDialog {
  value: number
  breakEvenPrice: number
  executeData;
  btnStatus = true
  status;
  constructor(
    public dialogRef: MatDialogRef<EthWithdrawDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(this.data);
    this.breakEvenPrice = this.data.breakEvenPrice
    if (this.data.maxWithDrawValue == 0) this.status = "NO FREE ETH TO DRAW"
  }

  calculate(event) {
    this.value = Number(event)
    this.btnStatus = event > 0 && this.data.maxWithDrawValue ? false : true
    if (event > this.data.maxWithDrawValue) {
      this.value = this.data.maxWithDrawValue
    }
    let liq_price = ((this.data.eth - this.value) * this.data.ethPrice) * 2 / 3
    this.breakEvenPrice = this.data.debtValue * this.data.ethPrice / liq_price
    console.log(isNaN(this.breakEvenPrice))
    this.breakEvenPrice = isNaN(this.breakEvenPrice) ? 0 : this.breakEvenPrice
    this.data.value = this.value
    this.executeData = {
      ethFree: Number(this.value),
      breakEvenPrice: this.breakEvenPrice,
    }
  }
  onNoClick(): void {
    this.data.breakEvenPrice = this.breakEvenPrice
    this.dialogRef.close(this.executeData);
  }

}

//DAI PAYBACK
@Component({
  selector: 'daiPayback-dialog',
  templateUrl: 'payBackDialogBox.html',
})
export class DaiPaybackDialog {
  value: number
  breakEvenPrice: number
  executeData;
  btnStatus = true
  status;
  constructor(
    public dialogRef: MatDialogRef<DaiPaybackDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(this.data);
    this.breakEvenPrice = this.data.breakEvenPrice
    if (this.data.debtValue == 0) this.status = "No Debt to payback"
  }

  calculate(event) {
    this.value = Number(event)
    this.btnStatus = event > 0 && this.data.debtValue ? false : true
    if (event > this.data.debtValue) {
      this.value = this.data.debtValue
    }

    let maxLiq_price = ((this.data.eth) * this.data.ethPrice) * 2 / 3
    this.breakEvenPrice = (this.data.debtValue - this.value) * this.data.ethPrice / maxLiq_price
    this.data.value = this.value
    this.executeData = {
      daiPayback: Number(this.value),
      breakEvenPrice: this.breakEvenPrice,
    }
  }
  onNoClick(): void {
    this.data.breakEvenPrice = this.breakEvenPrice
    this.dialogRef.close(this.executeData);
  }

}


//alert Modal
@Component({
  selector: 'alert-dialog',
  templateUrl: 'alertDialogBox.html',
})
export class MakerAlertDialog {
  constructor(
    public dialogRef: MatDialogRef<MakerAlertDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(this.data);
  }


}
