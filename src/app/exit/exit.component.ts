import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Web3Service } from '../util/web3.service';


declare let require: any;
const tokens = require('../util/common/tokens.json')
const exitABI = require('../util/common/ABI/exitABI.json')


import { environment } from '../../environments/environment'

@Component({
  selector: 'app-exit',
  templateUrl: './exit.component.html',
  styleUrls: ['./exit.component.scss']
})
export class ExitComponent implements OnInit {
  public tokensBal = [
    { name: "ETH", url: "eth" },
    { name: "DAI", url: "dai" },
    { name: "USDC", url: "usdc" },
    { name: "MKR", url: "mkr" },
    { name: "ZRX", url: "zrx" },
    { name: "REP", url: "rep" },
    { name: "TUSD", url: "tusd" },
    { name: "BAT", url: "bat" },
    { name: "KNC", url: "knc" },
    { name: "WBTC", url: "wbtc" }
  ]

  public tokensUniSwap = [
    { name: "DAI", url: "dai" },
    { name: "USDC", url: "usdc" },
    { name: "MKR", url: "mkr" },
    { name: "ZRX", url: "zrx" },
    { name: "REP", url: "rep" },
    { name: "TUSD", url: "tusd" },
    { name: "BAT", url: "bat" },
    { name: "KNC", url: "knc" },
    { name: "WBTC", url: "wbtc" }
  ]

  userBalStats;
  CDPID = 0
  constructor(public web3: Web3Service, private httpClient: HttpClient) {
    web3.contractAccountObservable.subscribe(async (address) => {
      if (address != "0x0000000000000000000000000000000000000000") {
        let stats = await this.httpClient.get<any[]>(`${environment.mkr}/lad/${address}`).toPromise();
        let balancesData = await this.httpClient.get<any>(`${environment.instanode}/balance/${address}`).toPromise();
        this.userBalStats = balancesData.data
        if (stats.length > 0) {
          console.log(stats)
          this.createTokenBalStats(balancesData)
          this.CDPID = stats[0].id
        } else {

        }

      } else {
        this.tokensBal = [
          { name: "ETH", url: "eth" },
          { name: "DAI", url: "dai" },
          { name: "USDC", url: "usdc" },
          { name: "MKR", url: "mkr" },
          { name: "ZRX", url: "zrx" },
          { name: "REP", url: "rep" },
          { name: "TUSD", url: "tusd" },
          { name: "BAT", url: "bat" },
          { name: "KNC", url: "knc" },
          { name: "WBTC", url: "wbtc" }
        ]
        this.CDPID = 0
      }
    })
  }


  ngOnInit() {
  }

  createTokenBalStats(balStats) {
    this.tokensBal = []
    balStats.data.forEach((bal, index) => {
      let token = tokens[index]

      let obj = {
        address: token.address,
        name: token.symbol,
        url: (token.symbol).toLowerCase(),
        decimals: token.decimals,
        bal: Number(bal) / (10 ** token.decimals),
      }

      this.tokensBal.push(obj)
    })
  }

  withdrawToken(token) {
    let address = token.address
    console.log("Address:", address)
    if (address == "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") { // Transfer ETH
      let arg = [];
      console.log(arg)
      let callData = this.web3.getCallData(exitABI.withdrawETHLogic, arg)
      let executeData = {
        logicProxyName: "Exit",
        value: 0,
      }
      this.web3.executeFunction(callData, executeData)
    } else {
      let arg = [address];
      console.log(arg)
      let callData = this.web3.getCallData(exitABI.withdrawTokenLogic, arg)
      let executeData = {
        logicProxyName: "Exit",
        value: 0,
      }
      this.web3.executeFunction(callData, executeData)
    }
  }


  withdrawUniSwap(token) {
    let poolAddr = token.poolAddr
    let arg = [poolAddr];
    console.log(arg)
    let callData = this.web3.getCallData(exitABI.withdrawTokenLogic, arg)
    let executeData = {
      logicProxyName: "Exit",
      value: 0,
    }
    this.web3.executeFunction(callData, executeData)
  }


  withdrawCDP(CDP) {
    let arg = [CDP];
    console.log(arg)
    let callData = this.web3.getCallData(exitABI.withdrawCDPLogic, arg)
    let executeData = {
      logicProxyName: "Exit",
      value: 0,
    }
    this.web3.executeFunction(callData, executeData)
  }
}
