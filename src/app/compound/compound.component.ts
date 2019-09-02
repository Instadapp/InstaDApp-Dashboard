import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Web3Service } from '../util/web3.service';


declare let require: any;
const tokens = require('../util/common/tokens.json')
const tokensABI = require('../util/common/ABI/cTokensAbi.json')


import { environment } from '../../environments/environment'

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';



export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-compound',
  templateUrl: './compound.component.html',
  styleUrls: ['./compound.component.scss']
})
export class CompoundComponent implements OnInit {
  userStats: any
  userBalances = {}
  tokenPriceConversation;

  public tokensList = [
    { name: "ETH", url: "eth" },
    { name: "DAI", url: "dai" },
    { name: "USDC", url: "usdc" },
    { name: "ZRX", url: "zrx" },
    { name: "REP", url: "rep" },
    { name: "BAT", url: "bat" },
    { name: "WBTC", url: "wbtc" }
  ]

  tableStatus = false;
  lendBal = 0
  borrowBal = 0
  borrowingPowerBal = 0
  tokensListObservable: Observable<String[]>;

  constructor(public dialog: MatDialog, public web3: Web3Service, private httpClient: HttpClient) {

    web3.contractAccountObservable.subscribe(async (address) => {
      if (address != "0x0000000000000000000000000000000000000000") {
        let x = await this.httpClient.get<any[]>(`${environment.instanode}/compound/${address}`).toPromise();
        let balancesData = await this.httpClient.get<any[]>(`${environment.instanode}/balance/${web3.accounts[0]}`).toPromise();
        let priceConversationData = await this.httpClient.get<any[]>(`${environment.instanode}/stats/price`).toPromise();

        this.tokenPriceConversation = priceConversationData

        this.createTokensBalObj(balancesData)
        this.setUserStats(this.tokenPriceConversation, x)

        this.userStats = x
        this.userStats = this.userStats.data

        this.createTokenData(x)
      } else {
        this.tableStatus = false;
        this.tokensList = [
          { name: "ETH", url: "eth" },
          { name: "DAI", url: "dai" },
          { name: "USDC", url: "usdc" },
          { name: "ZRX", url: "zrx" },
          { name: "REP", url: "rep" },
          { name: "BAT", url: "bat" },
          { name: "WBTC", url: "wbtc" }
        ]
        this.lendBal = 0
        this.borrowBal = 0
        this.borrowingPowerBal = 0
      }



    })
  }

  ngOnInit() {
  }

  setUserStats(priceTable, userTokenStats) {
    priceTable = priceTable.data
    this.lendBal = userTokenStats.data.suppliedInETH * priceTable[0].price
    this.borrowBal = userTokenStats.data.borrowedInETH * priceTable[0].price
    this.borrowingPowerBal = userTokenStats.data.remainBorrowInETH * priceTable[0].price

  }

  createTokensBalObj(balData) {
    balData = balData.data
    balData.forEach((bal, index) => {
      this.userBalances[tokens[index].address] = bal
    })
  }

  private createTokenData(data) {
    this.tokensList = []
    let tokensPrice = this.tokenPriceConversation.data
    tokens.forEach((token, index) => {

      if (token.compound) {

        let address = token.address
        let stats = data.data[address]
        let type = ""
        let bal = 0

        if (stats.balSupply == 0 && stats.balBorrow == 0) {
          type = "primary"
        } else if (stats.balSupply > 0) {
          type = "success"
          bal = stats.balSupply
        } else if (stats.balBorrow > 0) {
          type = "warning"
          bal = stats.balBorrow
        }

        let obj = {
          cAddress: token.compound.caddress,
          address: token.address,
          price: tokensPrice[index].price,
          name: token.symbol,
          url: (token.symbol).toLowerCase(),
          decimals: token.decimals,
          supplyRate: this.roundToTwo(stats.supplyRate),
          borrowRate: this.roundToTwo(stats.borrowRate),
          type: type,
          bal: this.roundToTwo((bal)),
          balValue: bal * tokensPrice[index].price,
          exchangeRate: stats.exchangeRate
        }

        this.tokensList.push(obj)
        this.tableStatus = true;
      }
    })
    console.log(this.tokensList)
  }

  roundToTwo(num) {
    return num
  }


  supply(tokenStats) {
    let token = tokens.filter((x) => { return (x.address == tokenStats.address) })
    let data = tokenStats
    data.value = 0
    data.factor = token[0].compound.factor
    data.userTokenBal = this.userBalances[data.address] / (10 ** data.decimals)
    data.borrowingPowerBal = this.borrowingPowerBal
    this.openDialog("supply", data)
  }

  withdraw(tokenStats) {
    // let token = tokens.filter((x) =>{ return (x.address == tokenStats.address)})
    let data = tokenStats
    data.value = 0
    data.maxWithDraw = this.userStats[data.address].balSupply
    this.openDialog("withdraw", data)
  }

  borrow(tokenStats) {
    let token = tokens.filter((x) => { return (x.address == tokenStats.address) })
    let data = tokenStats
    data.value = 0
    let tokenOraclePrice = this.userStats[data.address].oraclePrice
    data.maxBorrowValue = this.userStats.remainBorrowInETH / tokenOraclePrice

    this.openDialog("borrow", data)
  }

  payBack(tokenStats) {
    let token = tokens.filter((x) => { return (x.address == tokenStats.address) })
    let data = tokenStats
    data.value = 0
    data.userTokenBal = this.userBalances[data.address] / (10 ** data.decimals)
    data.maxPayback = this.userStats[data.address].balBorrow
    data.paybackValue = 0
    console.log(data.userTokenBal)
    this.openDialog("payback", data)
  }

  openDialog(type, tokenData): void {
    if (type == "supply") {
      const dialogRef = this.dialog.open(SupplyDialog, {
        width: '300px',
        data: tokenData
      }, );

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.supplyExecute(result)
        }
      });
    } else if (type == "withdraw") {
      const dialogRef = this.dialog.open(WithdrawDialog, {
        width: '300px',
        data: tokenData
      }, );

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.withdrawExecute(result)
        }
      });
    } else if (type == "borrow") {
      const dialogRef = this.dialog.open(BorrowDialog, {
        width: '300px',
        data: tokenData
      }, );

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.borrowExecute(result)
        }
      });
    } else if (type == "payback") {
      const dialogRef = this.dialog.open(PayBackDialog, {
        width: '300px',
        data: tokenData
      }, );

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.paybackExecute(result)
        }

      });
    }

  }

  async paybackExecute(data) {
    let amount = Number(data.value) * 1.01
    amount = (amount * (10 ** data.decimals))
    let amountValue = amount.toFixed(0);

    let arg = [
      data.address,
      data.cAddress,
      amountValue
    ]

    let ethAmt = "0"
    if (data.address != "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
      let allowedAmt = await this.web3.getAllowance(data.address);
      if (allowedAmt < amount) {
        console.error("NOT ALLOWED")
        this.web3.setAllowance(data.address)
      }
    } else {
      ethAmt = amountValue
    }

    console.log(arg)
    let callData = this.web3.getCallData(tokensABI.repayTokenLogic, arg)
    let executeData = {
      logicProxyName: "InstaCompound",
      value: 0,
    }
    this.web3.executeFunction(callData, executeData)
  }

  async withdrawExecute(data) {
    let amount = Number(data.value) * 1.01
    amount = (amount * (10 ** data.decimals) / data.exchangeRate)
    let amountValue = amount.toFixed(0);

    let arg = [
      data.address,
      data.cAddress,
      amountValue
    ]

    console.log(arg)
    let callData = this.web3.getCallData(tokensABI.redeemCTokenLogic, arg)
    let executeData = {
      logicProxyName: "InstaCompound",
      value: 0,
    }
    this.web3.executeFunction(callData, executeData)
  }



  async borrowExecute(data) {
    let amount = Number(data.value)
    amount = (amount * (10 ** data.decimals))
    let amountValue = amount.toFixed(0);

    let arg = [
      data.address,
      data.cAddress,
      amountValue
    ]

    console.log(arg)
    let callData = this.web3.getCallData(tokensABI.borrowLogic, arg)
    let executeData = {
      logicProxyName: "InstaCompound",
      value: 0,
    }
    this.web3.executeFunction(callData, executeData)
  }

  async supplyExecute(data) {
    let amount = Number(data.value)
    amount = (amount * (10 ** data.decimals))
    let amountValue = amount.toFixed(0);

    let arg = [
      data.address,
      data.cAddress,
      amountValue
    ]

    console.log(arg)
    let callData = this.web3.getCallData(tokensABI.mintCTokenLogic, arg)
    let ethAmt = "0"

    if (data.address != "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
      let allowedAmt = await this.web3.getAllowance(data.address);
      if (allowedAmt < amount) {
        console.error("NOT ALLOWED")
        this.web3.setAllowance(data.address)
      }
    } else {
      ethAmt = amountValue
    }

    let executeData = {
      logicProxyName: "InstaCompound",
      value: ethAmt,
    }

    this.web3.executeFunction(callData, executeData)
  }
}


//SUPPLY
@Component({
  selector: 'supply-dialog',
  templateUrl: 'supplyDialogBox.html',
})
export class SupplyDialog {
  value: number
  btnStatus = true
  status = ""
  constructor(
    public dialogRef: MatDialogRef<SupplyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(this.data);
    if (this.data.userTokenBal == 0) this.status = "NO BALANCE"
    this.data.supplyValue = 0
    this.data.borrowingPower = 0
  }

  calculate(event) {
    this.btnStatus = event > 0 && this.data.userTokenBal ? false : true
    this.value = Number(event)

    if (this.data.userTokenBal == 0) {
      this.value = 0
      this.data.supplyValue = this.data.price * 0
      return
    }

    if (Number(event) > this.data.userTokenBal) {
      this.value = 0
      this.value = this.data.userTokenBal
    }

    this.data.supplyValue = this.data.price * event
    let borrowingPower = this.data.factor * this.data.supplyValue
    this.data.borrowingPower = borrowingPower
    this.data.value = this.value
  }
  someValue: boolean = false;
  onNoClick(): void {
    this.dialogRef.close(this.data);
  }

}

// WITHDRAW
@Component({
  selector: 'withdraw-dialog',
  templateUrl: 'withdrawDialogBox.html',
})
export class WithdrawDialog {
  value: number
  btnStatus = true;
  status = "";
  color = 'accent';
  checked = false;
  constructor(
    public dialogRef: MatDialogRef<WithdrawDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(this.data);
    if (this.data.bal == 0) this.status = "MAX AMOUNT IS WITHDRAWN"
    this.data.withdrawValue = 0
  }

  calculate(event) {
    if (event != this.data.maxWithDraw) {
      this.checked = false
    }
    this.btnStatus = event > 0 && this.data.bal ? false : true
    this.value = Number(event)

    if (Number(event) > this.data.bal) {
      this.value = 0
      this.value = this.data.bal
    }

    this.data.withdrawValue = this.data.price * event
    this.data.value = this.value
  }

  changed() {
    if (this.checked) {
      this.calculate(this.data.maxWithDraw * 1.01)
    }
  }


  onNoClick(): void {
    this.dialogRef.close(this.data);
  }

}



//BORROW
@Component({
  selector: 'borrow-dialog',
  templateUrl: 'borrowDialogBox.html',
})
export class BorrowDialog {
  value: number
  btnStatus = true
  status = ""
  constructor(
    public dialogRef: MatDialogRef<BorrowDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(this.data);
    if (this.data.maxBorrowValue == 0) this.status = "MAX AMOUNT IS WITHDRAWN"
    this.data.borrowValue = 0
  }

  calculate(event) {
    this.btnStatus = event > 0 && this.data.maxBorrowValue ? false : true
    this.value = Number(event)
    if (Number(event) > this.data.maxBorrowValue) {
      this.value = 0
      this.value = this.data.maxBorrowValue
    }
    this.data.borrowValue = this.data.price * event
    this.data.value = this.value
  }
  onNoClick(): void {
    this.dialogRef.close(this.data);
  }

}


//PayBack
@Component({
  selector: 'payback-dialog',
  templateUrl: 'payBackDialogBox.html',
})
export class PayBackDialog {
  value: number
  btnStatus = true
  status = ""
  color = 'accent';
  checked = false;
  constructor(
    public dialogRef: MatDialogRef<PayBackDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(this.data);
    if (this.data.userTokenBal == 0) this.status = "NO BALANCE"
    this.data.paybackValue = 0
  }

  calculate(event) {
    if (event != this.data.maxPayback) {
      this.checked = false
    }
    this.btnStatus = event > 0 && this.data.userTokenBal ? false : true
    this.value = Number(event)
    if (event > this.data.maxPayback) {
      // this.value = this.data.maxPayback
      this.status = "Not enough debt available to payback"
      this.btnStatus = true
    } else if (event > this.data.userTokenBal) {
      // this.value = this.data.userTokenBal
      this.status = "Not enough balance available to payback"
      this.btnStatus = true
    } else {
      this.status = ""
      this.btnStatus = false
      this.data.paybackValue = this.value * this.data.price
      this.data.value = this.value
    }
  }



  changed() {
    if (this.checked) {
      this.calculate(this.data.maxPayback)
    }
    console.log(this.checked)
  }


  onNoClick(): void {
    this.dialogRef.close(this.data);
  }

}
