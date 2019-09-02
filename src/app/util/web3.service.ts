import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

declare let require: any;
const Web3 = require('web3');

const instaRegistryABI = require('./common/ABI/instaRegistry.json')
const userProxyABI = require('./common/ABI/userProxy.json')
const ERC20ABI = require('./common/ABI/ERC20ABI.json')

const variable = require('./common/variable.json')


declare let window: any;

@Injectable()
export class Web3Service {
  private web3: any;
  public accounts: string;
  public contractAccount: string[];

  public ready = false;
  private contractInstance: any;
  public accountsObservable = new Subject<string[]>();
  public contractAccountObservable = new Subject<string>();
  public tnxHashObservable = new Subject<string>();
  public tnxStatusObservable = new Subject<boolean>();
  private tnxInterval;


  private contractAddress = {
    registry: "0x498b3BfaBE9F73db90D252bCD4Fa9548Cd0Fd981",
    bridge: "0x37aCfEf331e6063C8507C2A69c97B4f78c770A5A",
    splitswap: "0xa4bca645f9cb9e6f9ad8c56d90a65b07c2f4e1dd",
    logics: {
      InstaMaker: "0x8e18152D3C1B1dD9F6573e2aDb07744390cE5035",
      InstaTrade: "0x750F4cbdEb98049c3Dc3492b729b66f0fA56bcBf",
      InstaUniswapPool: "0x84055ac6916A2eB49F8b492c55a77248cde50A07",
      InstaCompound: "0x956eBA6cc01941b50C36cf6c5c0480a14f0D669C",
      InstaSave: "0x94F5b439993bC7069C77a690681271cdc599FE1a",
      InstaBridge: "0xd8e0090dfA23D48cF343016758bb06f8c1567058",
      InstaCompSave: "0xCEfd72398C9BABBD38537e72F45EdAc3DF46CA25",
      Exit: "0xEa877248310E167B90dBA9922026b613Ce2C5cA4"
    }
  }

  constructor() {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });

    // refreshing Stats
    // setInterval(() => {
    //   console.log("refreshing")
    //   this.reload()
    // }, 5*60*1000);
  }

  public async bootstrapWeb3() {
    if (window.ethereum) { // Modern dapp browsers...
      window.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable(); // Request account access if needed
        this.web3 = new Web3(window.web3.currentProvider);
      } catch (error) {
        console.log('User denied permission / !userAccount / !userProxy');
      }
    }
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    else if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log('No web3? You should consider trying MetaMask!');

      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    }

    setInterval(() => this.refreshAccounts(), 100);
  }





  private refreshAccounts() {
    this.web3.eth.getAccounts(async (err, accs) => {
      if (err) {
        console.log(err)
        console.warn('There was an error fetching your accounts.');
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return;
      }
      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');

        this.accountsObservable.next(accs);
        this.accounts = accs;
        // await this.connectToWallet(accs[0])
      }

      this.ready = true;
    });
  }

  public reload() {
    if (this.accounts && this.accounts.length > 0) {
      let address = [this.accounts[0]]
      console.log(address)
      this.accountsObservable.next(address);
    }

  }

  public async connectToWallet(address) {
    let web3 = this.web3;

    this.contractInstance = new web3.eth.Contract(instaRegistryABI, variable.instaRegistry)

    this.contractInstance.options.address = variable.instaRegistry
    await this.contractInstance.methods.proxies(address).call().then(data => {
      this.contractAccountObservable.next(data)
      this.contractAccount = data
    })
    return this.contractAccount
  }


  public getBlock() {
    this.web3.eth.getBlockNumber((err, accs) => { console.log(accs) })
  }

  // create call data for function
  getCallData(abi, args) {
    let callData = this.web3.eth.abi.encodeFunctionCall(abi, args)
    return callData
  }

  async executeFunction(callData, data) {
    let logicProxyAddr = this.contractAddress.logics[data.logicProxyName]
    let userAccount = this.accounts[0]
    let userProxy = this.contractAccount
    let value = data.value
    let sessionID = String(new Date().getTime());

    console.log("User Proxy: ", userProxy);
    console.log("User Account: ", userAccount);
    console.log("Logic Proxy: ", logicProxyAddr);
    console.log("ETH value: ", value);

    let UserProxyContract = new this.web3.eth.Contract(userProxyABI, userProxy);
    UserProxyContract.methods.execute(logicProxyAddr, callData, "3", sessionID).send({
      from: userAccount,
      value: value
    },
      (err, result) => {
        if (err) {
          console.log(err);
          return
        }
        this.tnxHashObservable.next(result)
        // this.tnxComfirmation(result)
        console.log("tnx Hash: ", result);
      }
    )
  }

  //Sets tx has an observable
  async tnxComfirmation(txHash) {
    this.tnxHashObservable.next(txHash)
  }

  // get Transaction Receipt
  async getTX(txHash) {
    let data
    await this.web3.eth.getTransactionReceipt(txHash).then((result) => {
      data = result
    })
    return data
  }

  // get user allowance
  async getAllowance(_tokenAddr) {
    let userAccount = this.accounts[0]
    let userProxy = this.contractAccount
    let allowedAmt = 0
    var TokenContract = new this.web3.eth.Contract(ERC20ABI, _tokenAddr);
    await TokenContract.methods.allowance(userAccount, userProxy).call().then(data => {
      allowedAmt = Number(data._hex)
    })
    console.log("Allowed Amount:",allowedAmt)
    return allowedAmt
  }

  // set allowance for userProxy
  async setAllowance(_tokenAddr) {
    let userAccount = this.accounts[0]
    let userProxy = this.contractAccount
    let allowanceAmt = 1000000000000; // 1 trillion
    allowanceAmt = this.web3.utils.toWei(allowanceAmt.toString(), 'ether'); // 18 decimal'ed
    let TokenContract = new this.web3.eth.Contract(ERC20ABI, _tokenAddr);
    TokenContract.methods.approve(userProxy, allowanceAmt.toString()).send({
      from: userAccount,
      value: 0
    }).then(data => {
      console.log(data)
    })
  }

}
